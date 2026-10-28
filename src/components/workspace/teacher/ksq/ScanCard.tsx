import { computeScore, formatScore, keyReady, KSQ_VARIANTS, variantKey } from '../../../../lib/ksq';
import type { KsqLetter, KsqTest, KsqVariant } from '../../../../types';
import { Button } from '../../../ui/Button';
import { BubbleRow } from './BubbleRow';
import type { Scan } from './scan';

interface ScanCardProps {
  scan: Scan;
  test: KsqTest;
  onChange: (patch: Partial<Scan>) => void;
  onSave: () => void;
  onRetry: () => void;
  onRemove: () => void;
}

const fieldClass =
  'w-full rounded-xl border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink placeholder:text-brand-faint focus:border-brand-blue disabled:bg-brand-chipBg';

function StatusPill({ scan }: { scan: Scan }) {
  let label: string;
  let className: string;

  if (scan.saved) {
    label = 'Saxlanıb';
    className = 'bg-online-bg text-online-text';
  } else if (scan.status === 'waiting') {
    label = 'Növbədə';
    className = 'bg-brand-chipBg text-brand-muted';
  } else if (scan.status === 'processing') {
    label = 'Oxunur…';
    className = 'bg-online-bg text-online-text';
  } else if (scan.status === 'error') {
    label = 'Xəta';
    className = 'bg-danger-bg text-danger-text';
  } else if (scan.unsure.length > 0 || scan.qeyd) {
    label = 'Yoxlayın';
    className = 'bg-paid-bg text-paid-text';
  } else {
    label = 'Hazır';
    className = 'bg-live-bg text-live-text';
  }

  return (
    <span className={`status-badge gap-1.5 ${className}`}>
      {scan.status === 'processing' && !scan.saved && (
        <span
          aria-hidden
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {label}
    </span>
  );
}

export function ScanCard({ scan, test, onChange, onSave, onRetry, onRemove }: ScanCardProps) {
  const closedCount = test.closedPoints.length;
  const key = variantKey(test, scan.variant);
  const ready = keyReady(key, closedCount);
  const busy = scan.status === 'waiting' || scan.status === 'processing';
  const locked = busy || scan.saved || scan.saving;

  const score = computeScore(test.closedPoints, test.openPoints, key, scan.cavablar, scan.aciq);

  function setAnswer(index: number, letter: KsqLetter | null) {
    const next = [...scan.cavablar];
    next[index] = letter;
    onChange({ cavablar: next });
  }

  function setOpen(index: number, raw: string) {
    const next = [...scan.aciq];
    next[index] = raw === '' ? null : Math.max(0, Math.min(test.openPoints[index], Number(raw)));
    onChange({ aciq: next });
  }

  return (
    <article className="card space-y-4 p-4 sm:p-5">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange({ expanded: !scan.expanded })}
          aria-label={scan.expanded ? 'Şəkli kiçilt' : 'Şəkli böyüt'}
          className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-brand-border bg-brand-chipBg"
        >
          <img src={scan.previewUrl} alt="Cavab kartı" className="h-full w-full object-cover" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusPill scan={scan} />
            <p className="font-heading text-lg font-bold text-brand-navy">
              {ready ? formatScore(score.bal) : '—'}{' '}
              <span className="text-sm font-semibold text-brand-muted">/ {formatScore(score.max)}</span>
            </p>
          </div>
          {scan.error && <p className="mt-1.5 text-[13px] text-danger-text">{scan.error}</p>}
          {scan.qeyd && <p className="mt-1.5 text-[13px] text-paid-text">AI qeydi: {scan.qeyd}</p>}
          {!ready && (
            <p className="mt-1.5 text-[13px] text-danger-text">
              {scan.variant} variantının açarı hazır deyil — Açar bölməsində tamamlayın.
            </p>
          )}
        </div>
      </div>

      {scan.expanded && (
        <button
          type="button"
          onClick={() => onChange({ expanded: false })}
          className="block w-full overflow-hidden rounded-xl border border-brand-border"
        >
          <img src={scan.previewUrl} alt="Cavab kartı (böyük)" className="w-full" />
        </button>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2 sm:grid-cols-[minmax(0,1fr)_100px_minmax(0,140px)]">
        <input
          className={fieldClass}
          placeholder="Şagirdin adı"
          aria-label="Şagirdin adı"
          maxLength={200}
          value={scan.ad}
          disabled={locked}
          onChange={(e) => onChange({ ad: e.target.value })}
        />
        <select
          className={fieldClass}
          aria-label="Variant"
          value={scan.variant}
          disabled={locked}
          onChange={(e) => onChange({ variant: e.target.value as KsqVariant })}
        >
          {KSQ_VARIANTS.map((v) => (
            <option key={v} value={v}>
              {v} variantı
            </option>
          ))}
        </select>
        <input
          className={`${fieldClass} col-span-2 sm:col-span-1`}
          placeholder="Kod"
          aria-label="Kod"
          maxLength={50}
          value={scan.kod}
          disabled={locked}
          onChange={(e) => onChange({ kod: e.target.value })}
        />
      </div>

      <fieldset disabled={locked} className="grid grid-cols-1 gap-x-6 gap-y-1 min-[430px]:grid-cols-2">
        {scan.cavablar.map((answer, i) => (
          <BubbleRow
            key={i}
            number={i + 1}
            value={answer}
            correct={ready ? key[i] : null}
            unsure={scan.unsure.includes(i + 1)}
            onChange={(letter) => setAnswer(i, letter)}
          />
        ))}
      </fieldset>

      {test.openPoints.length > 0 && (
        <div className="space-y-2">
          {test.openPoints.map((max, j) => {
            const number = closedCount + j + 1;
            return (
              <label
                key={j}
                className={`flex flex-wrap items-center gap-2 rounded-xl px-1.5 py-1 text-sm ${
                  scan.unsure.includes(number) ? 'bg-paid-bg' : ''
                }`}
              >
                <span className="w-7 text-right font-heading text-[13px] font-bold text-brand-muted">
                  {number}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={max}
                  step={0.5}
                  placeholder={`0–${max}`}
                  disabled={locked}
                  value={scan.aciq[j] ?? ''}
                  onChange={(e) => setOpen(j, e.target.value)}
                  className="w-20 rounded-lg border border-brand-border bg-white px-2 py-1.5 text-center text-[13px] text-brand-ink focus:border-brand-blue disabled:bg-brand-chipBg"
                />
                <span className="text-brand-faint">/ {max} bal</span>
                {scan.aciqText[j] && (
                  <span className="min-w-0 flex-1 truncate text-[13px] text-brand-muted">
                    Yazılıb: {scan.aciqText[j]}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {!scan.saved && (
          <Button size="sm" onClick={onSave} disabled={busy || scan.saving || !ready}>
            {scan.saving ? 'Saxlanılır…' : 'Saxla'}
          </Button>
        )}
        {scan.status === 'error' && !scan.saved && (
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Yenidən oxu
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onRemove} disabled={scan.status === 'processing'}>
          Siyahıdan çıxar
        </Button>
        {ready && score.sehv.length > 0 && (
          <span className="ml-auto text-[13px] text-brand-muted">Səhv: {score.sehv.join(', ')}</span>
        )}
      </div>
    </article>
  );
}
