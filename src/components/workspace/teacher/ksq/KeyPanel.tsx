import { useEffect, useMemo, useState } from 'react';
import { ksqApi } from '../../../../api';
import { apiErrorMessage } from '../../../../hooks/useApiError';
import { useToast } from '../../../../hooks/useToast';
import {
  KSQ_MAX_CLOSED,
  KSQ_MAX_OPEN,
  KSQ_PRESETS,
  KSQ_VARIANTS,
  keyReady,
  normalize,
  normalizePoints,
  sum,
} from '../../../../lib/ksq';
import type { KsqLetter, KsqTest, KsqVariant, SaveKsqTestRequest } from '../../../../types';
import { Button } from '../../../ui/Button';
import { Chip } from '../../../ui/Chip';
import { ErrorNote } from '../../../ui/ErrorNote';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Select';
import { BubbleRow } from './BubbleRow';

const NEW_TEST = '';

function emptyDraft(): SaveKsqTestRequest {
  const preset = KSQ_PRESETS[0];
  return {
    name: '',
    closedPoints: [...preset.closed],
    openPoints: [...preset.open],
    keyA: normalize([], preset.closed.length, null),
    keyB: normalize([], preset.closed.length, null),
  };
}

function toDraft(test: KsqTest): SaveKsqTestRequest {
  return {
    name: test.name,
    closedPoints: [...test.closedPoints],
    openPoints: [...test.openPoints],
    keyA: [...test.keyA],
    keyB: [...test.keyB],
  };
}

function sameNumbers(a: number[], b: number[]) {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

interface KeyPanelProps {
  tests: KsqTest[];
  onSaved: (test: KsqTest) => void;
  onDeleted: (id: string) => void;
}

export function KeyPanel({ tests, onSaved, onDeleted }: KeyPanelProps) {
  const { toast } = useToast();

  const [selectedId, setSelectedId] = useState<string>(() => tests[0]?.id ?? NEW_TEST);
  const [draft, setDraft] = useState<SaveKsqTestRequest>(() =>
    tests[0] ? toDraft(tests[0]) : emptyDraft(),
  );
  const [dirty, setDirty] = useState(false);
  const [variant, setVariant] = useState<KsqVariant>('A');
  const [closedInput, setClosedInput] = useState(String(draft.closedPoints.length));
  const [openInput, setOpenInput] = useState(String(draft.openPoints.length));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seçilmiş test kənarda silinibsə (məs. başqa tabda) yeni qaralamaya keçirik.
  useEffect(() => {
    if (selectedId !== NEW_TEST && !tests.some((t) => t.id === selectedId)) {
      load(tests[0]?.id ?? NEW_TEST);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests]);

  const closedCount = draft.closedPoints.length;
  const openCount = draft.openPoints.length;
  const key = variant === 'A' ? draft.keyA : draft.keyB;

  const totals = useMemo(
    () => ({ closed: sum(draft.closedPoints), open: sum(draft.openPoints) }),
    [draft.closedPoints, draft.openPoints],
  );

  function load(id: string) {
    const test = tests.find((t) => t.id === id);
    const next = test ? toDraft(test) : emptyDraft();
    setSelectedId(id);
    setDraft(next);
    setClosedInput(String(next.closedPoints.length));
    setOpenInput(String(next.openPoints.length));
    setVariant('A');
    setDirty(false);
    setError(null);
  }

  function confirmDiscard() {
    return !dirty || window.confirm('Yadda saxlanmamış dəyişikliklər itəcək. Davam edilsin?');
  }

  function update(patch: Partial<SaveKsqTestRequest>) {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
  }

  function resizeClosed(count: number) {
    setDraft((current) => ({
      ...current,
      closedPoints: normalizePoints(current.closedPoints, count),
      keyA: normalize(current.keyA, count, null),
      keyB: normalize(current.keyB, count, null),
    }));
    setDirty(true);
  }

  function resizeOpen(count: number) {
    setDraft((current) => ({ ...current, openPoints: normalizePoints(current.openPoints, count) }));
    setDirty(true);
  }

  function applyPreset(closed: number[], open: number[]) {
    setDraft((current) => ({
      ...current,
      closedPoints: [...closed],
      openPoints: [...open],
      keyA: normalize(current.keyA, closed.length, null),
      keyB: normalize(current.keyB, closed.length, null),
    }));
    setClosedInput(String(closed.length));
    setOpenInput(String(open.length));
    setDirty(true);
  }

  function handleCountChange(
    raw: string,
    setRaw: (value: string) => void,
    min: number,
    max: number,
    apply: (count: number) => void,
  ) {
    setRaw(raw);
    const count = Number(raw);
    if (raw !== '' && Number.isInteger(count) && count >= min && count <= max) apply(count);
  }

  function setAnswer(index: number, letter: KsqLetter | null) {
    const field = variant === 'A' ? 'keyA' : 'keyB';
    setDraft((current) => {
      const next = [...current[field]];
      next[index] = letter;
      return { ...current, [field]: next };
    });
    setDirty(true);
  }

  function setPoint(field: 'closedPoints' | 'openPoints', index: number, raw: string) {
    const value = Math.max(0, Math.min(100, Math.round(Number(raw) || 0)));
    setDraft((current) => {
      const next = [...current[field]];
      next[index] = value;
      return { ...current, [field]: next };
    });
    setDirty(true);
  }

  async function handleSave() {
    setError(null);
    if (!draft.name.trim()) {
      setError('Testin adını yazın.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...draft, name: draft.name.trim() };
      const saved =
        selectedId === NEW_TEST
          ? await ksqApi.createTest(payload)
          : await ksqApi.updateTest(selectedId, payload);
      onSaved(saved);
      setSelectedId(saved.id);
      setDraft(toDraft(saved));
      setDirty(false);
      toast('Açar yadda saxlanıldı.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Açar yadda saxlanmadı.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (selectedId === NEW_TEST) {
      load(tests[0]?.id ?? NEW_TEST);
      return;
    }
    const test = tests.find((t) => t.id === selectedId);
    if (!window.confirm(`"${test?.name ?? ''}" testi və onun bütün nəticələri silinsin?`)) return;

    try {
      await ksqApi.deleteTest(selectedId);
      onDeleted(selectedId);
      load(tests.find((t) => t.id !== selectedId)?.id ?? NEW_TEST);
      toast('Test silindi.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Test silinmədi.'));
    }
  }

  const statusNote = KSQ_VARIANTS.map((v) => {
    const k = v === 'A' ? draft.keyA : draft.keyB;
    const filled = k.filter((x) => x !== null).length;
    return keyReady(k, closedCount)
      ? `${v} variantı hazırdır`
      : `${v} variantı: ${filled}/${closedCount} cavab seçilib`;
  }).join(' · ');

  return (
    <div className="space-y-5">
      <div className="card space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[200px] flex-1">
            <Select
              name="ksqSavedTest"
              label="Saxlanmış testlər"
              value={selectedId}
              onChange={(e) => confirmDiscard() && load(e.target.value)}
            >
              {selectedId === NEW_TEST && <option value={NEW_TEST}>Yeni test (saxlanmayıb)</option>}
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <Button
            variant="secondary"
            onClick={() => confirmDiscard() && load(NEW_TEST)}
            disabled={selectedId === NEW_TEST && !dirty}
          >
            + Yeni test
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Sil
          </Button>
        </div>

        <Input
          name="ksqTestName"
          label="Testin adı"
          placeholder="məs. Riyaziyyat KSQ-2, 9-cu sinif"
          maxLength={200}
          value={draft.name}
          onChange={(e) => update({ name: e.target.value })}
        />

        <div>
          <span className="mb-1.5 block font-heading text-[13px] font-semibold text-brand-slate">
            Format
          </span>
          <div className="flex flex-wrap gap-2">
            {KSQ_PRESETS.map((preset) => (
              <Chip
                key={preset.label}
                active={
                  sameNumbers(draft.closedPoints, preset.closed) &&
                  sameNumbers(draft.openPoints, preset.open)
                }
                onClick={() => applyPreset(preset.closed, preset.open)}
              >
                {preset.label}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="ksqClosedCount"
            type="number"
            inputMode="numeric"
            label="Qapalı sual sayı"
            min={1}
            max={KSQ_MAX_CLOSED}
            value={closedInput}
            onChange={(e) =>
              handleCountChange(e.target.value, setClosedInput, 1, KSQ_MAX_CLOSED, resizeClosed)
            }
            onBlur={() => setClosedInput(String(closedCount))}
          />
          <Input
            name="ksqOpenCount"
            type="number"
            inputMode="numeric"
            label="Açıq sual sayı"
            min={0}
            max={KSQ_MAX_OPEN}
            value={openInput}
            onChange={(e) =>
              handleCountChange(e.target.value, setOpenInput, 0, KSQ_MAX_OPEN, resizeOpen)
            }
            onBlur={() => setOpenInput(String(openCount))}
          />
        </div>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {KSQ_VARIANTS.map((v) => (
              <Chip key={v} active={variant === v} onClick={() => setVariant(v)}>
                {v} variantı
                {keyReady(v === 'A' ? draft.keyA : draft.keyB, closedCount) ? ' ✓' : ''}
              </Chip>
            ))}
          </div>
          <span className="text-xs text-brand-faint">Düzgün cavaba toxunun · sağda sualın balı</span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-1 min-[430px]:grid-cols-2">
          {draft.closedPoints.map((points, i) => (
            <BubbleRow
              key={i}
              number={i + 1}
              value={key[i] ?? null}
              onChange={(letter) => setAnswer(i, letter)}
              aside={
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={100}
                  aria-label={`${i + 1}. sualın balı`}
                  value={points}
                  onChange={(e) => setPoint('closedPoints', i, e.target.value)}
                  className="w-12 rounded-lg border border-brand-border bg-white px-1.5 py-1.5 text-center text-[13px] text-brand-ink focus:border-brand-blue"
                />
              }
            />
          ))}
        </div>

        {openCount > 0 && (
          <div>
            <span className="mb-1.5 block font-heading text-[13px] font-semibold text-brand-slate">
              Açıq suallar — maksimum bal
            </span>
            <div className="flex flex-wrap gap-3">
              {draft.openPoints.map((points, j) => (
                <label key={j} className="flex items-center gap-2 text-sm text-brand-slate">
                  <span className="font-heading font-semibold">{closedCount + j + 1}.</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    value={points}
                    onChange={(e) => setPoint('openPoints', j, e.target.value)}
                    className="w-16 rounded-lg border border-brand-border bg-white px-2 py-1.5 text-center text-[13px] text-brand-ink focus:border-brand-blue"
                  />
                  <span className="text-brand-faint">bal</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <p className="rounded-xl bg-brand-chipBg px-4 py-3 text-sm text-brand-slate">
          Ümumi bal: <strong className="text-brand-navy">{totals.closed + totals.open}</strong>{' '}
          (qapalı: {totals.closed} + açıq: {totals.open})
        </p>

        <ErrorNote message={error} />

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saxlanılır…' : 'Açarı yadda saxla'}
          </Button>
          <span className="text-[13px] text-brand-muted">
            {statusNote}
            {dirty ? ' · yadda saxlanmayıb' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
