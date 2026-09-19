import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { examsApi, resourcesApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { useDownload } from '../../../hooks/useDownload';
import { PriceBadge, StatusBadge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { ErrorNote } from '../../ui/ErrorNote';
import { Spinner } from '../../ui/Spinner';
import { resourceTypeLabel } from '../../../lib/format';
import type { Exam, Resource } from '../../../types';

export default function PurchasedTab() {
  const { download, pendingId } = useDownload();

  const [resources, setResources] = useState<Resource[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([resourcesApi.purchased(), examsApi.purchased()])
      .then(([purchasedResources, purchasedExams]) => {
        if (cancelled) return;
        setResources(purchasedResources);
        setExams(purchasedExams);
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Siyahı yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const isEmpty = resources.length === 0 && exams.length === 0;

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">Aldıqlarım</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Ödənişi tamamlanmış resurslar və sınaqlar. Təlimləriniz «Təlimlərim»
        bölməsindədir.
      </p>

      <div className="mt-5">
        {isEmpty ? (
          <EmptyState
            title="Hələ heç nə almamısınız"
            text="Resurs Bankından və ya sınaq kataloqundan material aldıqda burada görünəcək."
            action={
              <Link to="/resurslar">
                <Button size="sm" variant="secondary">
                  Resurs Bankına keç
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-8">
            {resources.length > 0 && (
              <div>
                <h3 className="font-heading text-base font-bold text-brand-navy">
                  Resurslar ({resources.length})
                </h3>
                <ul className="card mt-3 !p-0">
                  {resources.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-3 border-b border-brand-borderLight px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-[15px] font-semibold text-brand-navy">
                          <Link
                            to={`/resurslar/${item.id}`}
                            className="hover:text-brand-blue"
                          >
                            {item.name}
                          </Link>
                        </p>
                        <p className="mt-0.5 text-sm text-brand-muted">
                          {item.subject} · {item.grade}-ci sinif ·{' '}
                          {resourceTypeLabel(item.type)}
                        </p>
                      </div>
                      <PriceBadge isPaid={item.isPaid} price={item.price} />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === item.id}
                        onClick={() => download(item.id)}
                      >
                        {item.type === 'Video'
                          ? 'İzlə'
                          : item.isLinkBased
                            ? 'Aç'
                            : 'Endir'}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {exams.length > 0 && (
              <div>
                <h3 className="font-heading text-base font-bold text-brand-navy">
                  Sınaqlar ({exams.length})
                </h3>
                <ul className="card mt-3 !p-0">
                  {exams.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center gap-3 border-b border-brand-borderLight px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-[15px] font-semibold text-brand-navy">
                          <Link to={`/sinaqlar/${item.id}`} className="hover:text-brand-blue">
                            {item.name}
                          </Link>
                        </p>
                        <p className="mt-0.5 text-sm text-brand-muted">
                          {item.subject} · {item.questionCount} sual ·{' '}
                          {item.durationMinutes} dəq
                        </p>
                      </div>
                      <StatusBadge tone="free">Alınıb</StatusBadge>
                      <Link to={`/sinaqlar/${item.id}`}>
                        <Button size="sm" variant="secondary">
                          Sınağa keç
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
