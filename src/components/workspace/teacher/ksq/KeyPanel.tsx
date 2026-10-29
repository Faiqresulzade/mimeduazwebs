import { useEffect, useMemo, useState } from 'react';
import { ksqApi } from '../../../../api';
import { apiErrorMessage } from '../../../../hooks/useApiError';
import { useToast } from '../../../../hooks/useToast';
import {
  detectFormat,
  KSQ_CUSTOM,
  KSQ_MAX_CLOSED,
  KSQ_MAX_OPEN,
  KSQ_NEW_CLOSED_POINTS,
  KSQ_NEW_OPEN_POINTS,
  KSQ_PRESETS,
  KSQ_VARIANTS,
  keyReady,
  normalize,
  presetMatches,
  sum,
  type KsqFormat,
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
  const [format, setFormat] = useState<KsqFormat>(() =>
    detectFormat(draft.closedPoints, draft.openPoints),
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
  const total = totals.closed + totals.open;

  function load(id: string) {
    const test = tests.find((t) => t.id === id);
    const next = test ? toDraft(test) : emptyDraft();
    setSelectedId(id);
    setDraft(next);
    setFormat(detectFormat(next.closedPoints, next.openPoints));
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

  /**
   * Bal və ya say dəyişəndə: preset aktivdirsə və yeni massivlər ona artıq
   * uyğun gəlmirsə, chip avtomatik Sərbəst-ə keçir.
   */
  function applyPoints(closedPoints: number[], openPoints: number[]) {
    setDraft((current) => ({
      ...current,
      closedPoints,
      openPoints,
      // Yeni qapalı sualın cavabı hər iki variantda boşdur; azalanda sondan kəsilir.
      keyA: normalize(current.keyA, closedPoints.length, null),
      keyB: normalize(current.keyB, closedPoints.length, null),
    }));
    if (format !== KSQ_CUSTOM && !presetMatches(format, closedPoints, openPoints)) {
      setFormat(KSQ_CUSTOM);
    }
    setDirty(true);
  }

  /** Preset seçiləndə onun say və balları tətbiq olunur; mövcud sualların cavabları qalır. */
  function selectPreset(index: number) {
    const preset = KSQ_PRESETS[index];
    setFormat(index);
    applyPoints([...preset.closed], [...preset.open]);
    setClosedInput(String(preset.closed.length));
    setOpenInput(String(preset.open.length));
  }

  /** Sərbəst seçiləndə heç nə sıfırlanmır — müəllim cari formatdan davam edir. */
  function selectCustom() {
    setFormat(KSQ_CUSTOM);
  }

  /**
   * Say sahəsi: boş və ya rəqəm olmayan yazı nəzərə alınmır (blur-da əvvəlki dəyər qayıdır),
   * rəqəm isə tam ədədə yuvarlaqlaşdırılıb min/max arasına salınır.
   */
  function handleCountChange(
    raw: string,
    setRaw: (value: string) => void,
    min: number,
    max: number,
    apply: (count: number) => void,
  ) {
    const value = Number(raw);
    if (raw.trim() === '' || !Number.isFinite(value)) {
      setRaw(raw);
      return;
    }
    const count = Math.min(max, Math.max(min, Math.round(value)));
    setRaw(String(count));
    apply(count);
  }

  function resizeClosed(count: number) {
    applyPoints(normalize(draft.closedPoints, count, KSQ_NEW_CLOSED_POINTS), draft.openPoints);
  }

  function resizeOpen(count: number) {
    applyPoints(draft.closedPoints, normalize(draft.openPoints, count, KSQ_NEW_OPEN_POINTS));
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

  /** Bal: tam ədəd, 0–100. Boş sahə 0 sayılır ki, NaN heç vaxt saxlanmasın. */
  function setPoint(field: 'closedPoints' | 'openPoints', index: number, raw: string) {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const value = Math.max(0, Math.min(100, Math.round(parsed)));

    const next = [...draft[field]];
    next[index] = value;
    if (field === 'closedPoints') applyPoints(next, draft.openPoints);
    else applyPoints(draft.closedPoints, next);
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
      setFormat(detectFormat(saved.closedPoints, saved.openPoints));
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
            {KSQ_PRESETS.map((preset, index) => (
              <Chip key={preset.label} active={format === index} onClick={() => selectPreset(index)}>
                {preset.label}
              </Chip>
            ))}
            <Chip active={format === KSQ_CUSTOM} onClick={selectCustom}>
              Sərbəst
            </Chip>
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
            disabled={format !== KSQ_CUSTOM}
            className="disabled:bg-brand-chipBg disabled:text-brand-muted"
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
            disabled={format !== KSQ_CUSTOM}
            className="disabled:bg-brand-chipBg disabled:text-brand-muted"
            value={openInput}
            onChange={(e) =>
              handleCountChange(e.target.value, setOpenInput, 0, KSQ_MAX_OPEN, resizeOpen)
            }
            onBlur={() => setOpenInput(String(openCount))}
          />
        </div>
        {format !== KSQ_CUSTOM && (
          <p className="text-xs text-brand-faint">
            Sual sayını dəyişmək üçün "Sərbəst" formatını seçin.
          </p>
        )}
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

        <div className="rounded-xl bg-brand-chipBg px-4 py-3 text-sm text-brand-slate">
          <p>
            Cəmi: <strong className="text-brand-navy">{total} bal</strong> (qapalı: {totals.closed}{' '}
            + açıq: {totals.open})
          </p>
          {/* Yalnız xəbərdarlıqdır — 100-dən fərqli cəmi olan test də saxlanır. */}
          {total !== 100 && (
            <p className="mt-1 font-medium text-paid-text">Diqqət: cəmi bal 100 deyil.</p>
          )}
        </div>

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
