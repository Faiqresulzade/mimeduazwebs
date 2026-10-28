import { useCallback, useEffect, useState } from 'react';
import { ksqApi } from '../../../../api';
import { apiErrorMessage } from '../../../../hooks/useApiError';
import { useToast } from '../../../../hooks/useToast';
import { buildResultsCsv, csvFileName, downloadCsv, formatScore } from '../../../../lib/ksq';
import type { KsqResultList, KsqTest } from '../../../../types';
import { Button } from '../../../ui/Button';
import { EmptyState } from '../../../ui/EmptyState';
import { ErrorNote } from '../../../ui/ErrorNote';
import { Select } from '../../../ui/Select';
import { Spinner } from '../../../ui/Spinner';
import { StatCard } from '../../../ui/StatCard';

interface ResultsPanelProps {
  tests: KsqTest[];
  /** Tab görünəndə siyahı yenilənir — Yoxla-da saxlanan nəticələr dərhal görünsün. */
  active: boolean;
}

export function ResultsPanel({ tests, active }: ResultsPanelProps) {
  const { toast } = useToast();

  const [testId, setTestId] = useState('');
  const [sinif, setSinif] = useState('');
  const [data, setData] = useState<KsqResultList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await ksqApi.results({ testId: testId || undefined, sinif: sinif || undefined }));
    } catch (err) {
      setError(apiErrorMessage(err, 'Nəticələr yüklənmədi.'));
    } finally {
      setLoading(false);
    }
  }, [testId, sinif]);

  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  // Filtrdəki test silinibsə filtr sıfırlanır.
  useEffect(() => {
    if (testId && !tests.some((t) => t.id === testId)) setTestId('');
  }, [tests, testId]);

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`${name || 'Bu şagirdin'} nəticəsi silinsin?`)) return;
    try {
      await ksqApi.deleteResult(id);
      setData((current) =>
        current ? { ...current, items: current.items.filter((r) => r.id !== id) } : current,
      );
      toast('Nəticə silindi.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Nəticə silinmədi.'));
    }
  }

  function handleExport() {
    if (!data?.items.length) return;
    downloadCsv(buildResultsCsv(data.items), csvFileName());
    toast('CSV faylı yükləndi.');
  }

  const items = data?.items ?? [];
  const classes = data?.classes ?? [];
  const average = items.length ? items.reduce((t, r) => t + r.bal, 0) / items.length : 0;
  const best = items.length ? Math.max(...items.map((r) => r.bal)) : 0;
  const averagePercent = items.length
    ? Math.round((items.reduce((t, r) => t + (r.max ? r.bal / r.max : 0), 0) / items.length) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div className="card grid gap-3 sm:grid-cols-2">
        <Select
          name="ksqResultTest"
          label="Test"
          value={testId}
          onChange={(e) => {
            setTestId(e.target.value);
            setSinif('');
          }}
        >
          <option value="">Bütün testlər</option>
          {tests.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
        <Select
          name="ksqResultClass"
          label="Sinif"
          value={sinif}
          onChange={(e) => setSinif(e.target.value)}
        >
          <option value="">Bütün siniflər</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Şagird" value={String(items.length)} />
        <StatCard
          label="Orta bal"
          value={items.length ? formatScore(Math.round(average * 10) / 10) : '—'}
          hint={items.length ? `${averagePercent}%` : undefined}
        />
        <StatCard label="Ən yüksək" value={items.length ? formatScore(best) : '—'} />
      </div>

      <ErrorNote message={error} />

      {loading && !data ? (
        <Spinner />
      ) : items.length === 0 ? (
        <EmptyState
          title="Hələ nəticə yoxdur"
          text="Yoxla bölməsində kartları oxudub saxlayın — nəticələr burada görünəcək."
        />
      ) : (
        <div className="card overflow-x-auto p-0 sm:p-0">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-brand-borderLight text-[12px] uppercase tracking-[.06em] text-brand-faint">
              <tr>
                <th className="px-4 py-3 font-semibold">Şagird</th>
                <th className="px-2 py-3 font-semibold">Var.</th>
                <th className="px-2 py-3 font-semibold">Bal</th>
                <th className="px-2 py-3 font-semibold">Səhv suallar</th>
                <th className="px-2 py-3" aria-label="Əməliyyat" />
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-brand-borderLight last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-navy">{r.ad || '—'}</p>
                    <p className="text-xs text-brand-faint">
                      {[r.sinif, testId ? '' : r.test, r.kod].filter(Boolean).join(' · ')}
                    </p>
                  </td>
                  <td className="px-2 py-3 font-heading font-semibold">{r.variant}</td>
                  <td className="whitespace-nowrap px-2 py-3 font-heading font-bold text-brand-navy">
                    {formatScore(r.bal)}
                    <span className="font-semibold text-brand-faint"> / {formatScore(r.max)}</span>
                  </td>
                  <td className="px-2 py-3 text-brand-slate">{r.sehv.length ? r.sehv.join(', ') : '—'}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id, r.ad)}
                      aria-label={`${r.ad || 'Nəticəni'} sil`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-danger-text transition hover:bg-danger-bg"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button variant="secondary" onClick={handleExport} disabled={items.length === 0}>
        Excel üçün yüklə (CSV)
      </Button>
    </div>
  );
}
