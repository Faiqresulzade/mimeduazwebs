import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { useToast } from '../../../hooks/useToast';
import { PriceBadge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorNote } from '../../ui/ErrorNote';
import { Input } from '../../ui/Input';
import { Spinner } from '../../ui/Spinner';
import { resourceTypeLabel } from '../../../lib/format';
import type { ResourceDetail } from '../../../types';

export default function ModerationTab() {
  const { toast } = useToast();
  const [pending, setPending] = useState<ResourceDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminApi
      .pendingResources()
      .then((data) => !cancelled && setPending(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Növbə yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await adminApi.approveResource(id);
      setPending((current) => current.filter((item) => item.id !== id));
      toast('Təsdiqləndi və Resurs Bankına düşdü.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Təsdiq alınmadı.'));
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await adminApi.rejectResource(id, reason.trim() || undefined);
      setPending((current) => current.filter((item) => item.id !== id));
      setRejectingId(null);
      setReason('');
      toast('Rədd edildi.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Əməliyyat alınmadı.'));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">Moderasiya növbəsi</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Gözləyən {pending.length} material. Təsdiqlənən material dərhal Resurs Bankında
        görünür.
      </p>

      <div className="mt-5">
        {pending.length === 0 ? (
          <EmptyState
            title="Moderasiya növbəsi boşdur"
            text="Yeni material yükləndikdə burada görünəcək."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((item) => (
              <li key={item.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-[15px] font-semibold text-brand-navy">
                      <Link to={`/resurslar/${item.id}`} className="hover:text-brand-blue">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {item.authorName} · {item.subject} · {item.grade}-ci sinif ·{' '}
                      {resourceTypeLabel(item.type)}
                    </p>
                  </div>
                  <PriceBadge isPaid={item.isPaid} price={item.price} />
                </div>

                {/* Moderator təsdiqdən əvvəl materialın özünü görməlidir —
                    backend linki müəllifə/adminə həmişə açır. */}
                {item.externalUrl ? (
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block break-all text-sm font-semibold text-brand-blue hover:underline"
                  >
                    Materialı aç ↗ {item.externalUrl}
                  </a>
                ) : item.originalFileName ? (
                  <p className="mt-3 text-sm text-brand-muted">
                    Fayl: <span className="text-brand-ink">{item.originalFileName}</span>
                  </p>
                ) : null}

                {rejectingId === item.id ? (
                  <div className="mt-4 rounded-xl bg-danger-bg p-4">
                    <Input
                      name={`reason-${item.id}`}
                      label="Rədd səbəbi (istəyə bağlı)"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Material kurikuluma uyğun deyil."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === item.id}
                        onClick={() => reject(item.id)}
                      >
                        Rəddi təsdiqlə
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRejectingId(null);
                          setReason('');
                        }}
                      >
                        İmtina
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-borderLight pt-4">
                    <Button
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => approve(item.id)}
                    >
                      Təsdiqlə
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => setRejectingId(item.id)}
                    >
                      Rədd et
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
