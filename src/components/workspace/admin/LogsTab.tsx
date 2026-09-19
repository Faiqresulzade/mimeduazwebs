import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorNote } from '../../ui/ErrorNote';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';
import { formatDateTime, formatNumber } from '../../../lib/format';
import type { PagedResult, RequestLog } from '../../../types';

const PAGE_SIZE = 50;

function statusTone(statusCode: number) {
  if (statusCode >= 500) return 'bg-danger-bg text-danger-text';
  if (statusCode >= 400) return 'bg-paid-bg text-paid-text';
  return 'bg-free-bg text-free-text';
}

export default function LogsTab() {
  const [result, setResult] = useState<PagedResult<RequestLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [pathFilter, setPathFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [onlyErrors, setOnlyErrors] = useState(false);
  // Sorğuya yalnız "Axtar" düyməsi ilə göndərilir — hər hərfdə sorğu getməsin.
  const [applied, setApplied] = useState({ path: '', method: '', onlyErrors: false });

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);

    adminApi
      .logs({
        page,
        pageSize: PAGE_SIZE,
        path: applied.path || undefined,
        method: applied.method || undefined,
        onlyErrors: applied.onlyErrors || undefined,
      })
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Loglar yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, applied]);

  useEffect(() => load(), [load]);

  function search() {
    setPage(1);
    setApplied({ path: pathFilter.trim(), method: methodFilter.trim(), onlyErrors });
  }

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">Audit log</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Bütün API sorğularının tarixçəsi. Şifrə və token sahələri maskalanıb.
      </p>

      <div className="card mt-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            name="logPath"
            label="Yol"
            value={pathFilter}
            onChange={(event) => setPathFilter(event.target.value)}
            placeholder="/api/v1/resources"
          />
          <Input
            name="logMethod"
            label="Metod"
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
            placeholder="POST"
          />
        </div>

        <label className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            checked={onlyErrors}
            onChange={(event) => setOnlyErrors(event.target.checked)}
            className="h-4 w-4 accent-brand-blue"
          />
          <span className="font-heading text-sm font-semibold text-brand-slate">
            Yalnız xətalar
          </span>
        </label>

        <Button className="mt-4" size="sm" onClick={search}>
          Axtar
        </Button>
      </div>

      <div className="mt-5">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorNote message={error} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState title="Bu filtrə uyğun log tapılmadı" />
        ) : (
          <>
            <p className="text-sm text-brand-muted">
              {formatNumber(result.totalCount)} qeyd · səhifə {result.page} /{' '}
              {result.totalPages}
            </p>

            <ul className="card mt-3 !p-0">
              {result.items.map((log) => (
                <li key={log.id} className="border-b border-brand-borderLight last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    className="flex w-full flex-wrap items-center gap-3 px-5 py-3.5 text-left hover:bg-brand-hoverBg"
                  >
                    <span
                      className={`rounded-pill px-2.5 py-1 font-heading text-[11px] font-bold ${statusTone(
                        log.statusCode,
                      )}`}
                    >
                      {log.statusCode}
                    </span>
                    <span className="font-heading text-xs font-bold text-brand-slate">
                      {log.method}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm text-brand-ink">
                      {log.path}
                    </span>
                    <span className="text-xs text-brand-faint">{log.durationMs} ms</span>
                    <span className="text-xs text-brand-faint">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </button>

                  {expandedId === log.id && (
                    <div className="space-y-2 bg-brand-chipBg px-5 py-4 text-xs text-brand-ink">
                      <p>
                        <strong>Trace:</strong> {log.traceId}
                      </p>
                      {log.userEmail && (
                        <p>
                          <strong>İstifadəçi:</strong> {log.userEmail}
                        </p>
                      )}
                      {log.ipAddress && (
                        <p>
                          <strong>IP:</strong> {log.ipAddress}
                        </p>
                      )}
                      {log.queryString && (
                        <p className="break-all">
                          <strong>Query:</strong> {log.queryString}
                        </p>
                      )}
                      {log.exceptionType && (
                        <p className="text-danger-text">
                          <strong>Exception:</strong> {log.exceptionType}
                        </p>
                      )}
                      {log.requestBody && (
                        <div>
                          <strong>Sorğu:</strong>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3">
                            {log.requestBody}
                          </pre>
                        </div>
                      )}
                      {log.responseBody && (
                        <div>
                          <strong>Cavab:</strong>
                          <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white p-3">
                            {log.responseBody}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={result.page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Əvvəlki
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={result.page >= result.totalPages}
                onClick={() => setPage((value) => value + 1)}
              >
                Növbəti
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
