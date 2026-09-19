import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resourcesApi } from '../api';
import { getPassedResourceIds } from '../api/pending';
import { apiErrorMessage } from '../hooks/useApiError';
import { useAddToCart } from '../hooks/useAddToCart';
import { useAuth } from '../hooks/useAuth';
import { useDownload } from '../hooks/useDownload';
import { useToast } from '../hooks/useToast';
import { Avatar } from '../components/ui/Avatar';
import { PriceBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorNote } from '../components/ui/ErrorNote';
import { Spinner } from '../components/ui/Spinner';
import { VideoEmbed } from '../components/ui/VideoEmbed';
import { formatNumber, resourceTypeLabel } from '../lib/format';
import type { QuizMeta, ResourceDetail } from '../types';

export default function ResourceDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { add, pendingId: addingId } = useAddToCart();
  const { download, pendingId: downloadingId } = useDownload();

  const [resource, setResource] = useState<ResourceDetail | null>(null);
  const [quiz, setQuiz] = useState<QuizMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    resourcesApi
      .get(id)
      .then(async (data) => {
        if (cancelled) return;
        setResource(data);
        if (data.hasQuiz) {
          try {
            const meta = await resourcesApi.quizMeta(id);
            if (!cancelled) setQuiz(meta);
          } catch {
            // Quiz metadata alınmasa blok sadəcə göstərilmir.
          }
        }
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Resurs tapılmadı.')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Spinner />;

  if (error || !resource) {
    return (
      <div className="shell py-14">
        <ErrorNote message={error ?? 'Resurs tapılmadı.'} />
        <Link to="/resurslar" className="mt-4 inline-block text-sm font-semibold text-brand-blue">
          &larr; Resurs Bankı
        </Link>
      </div>
    );
  }

  const passed = getPassedResourceIds(user?.id).has(resource.id);
  const busy = addingId === resource.id || downloadingId === resource.id;
  const resourceId = resource.id;

  function startQuiz() {
    if (!isAuthenticated) {
      toast('Bunun üçün hesaba daxil olun.');
      navigate('/giris');
      return;
    }
    navigate(`/imtahan/${resourceId}`);
  }

  return (
    <div className="shell py-10 sm:py-14">
      <Link to="/resurslar" className="text-sm font-semibold text-brand-blue">
        &larr; Resurs Bankı
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="neutral">{resourceTypeLabel(resource.type)}</StatusBadge>
            <PriceBadge isPaid={resource.isPaid} price={resource.price} />
            {resource.status !== 'Approved' && (
              <StatusBadge tone={resource.status === 'Pending' ? 'info' : 'danger'}>
                {resource.status === 'Pending' ? 'Moderasiyada' : 'Rədd edilib'}
              </StatusBadge>
            )}
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-brand-navy">
            {resource.name}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-brand-ink">
            {resourceTypeLabel(resource.type)} formatında material. {resource.subject}{' '}
            fənni, {resource.grade}-ci sinif kurikulumuna uyğun hazırlanıb.{' '}
            {resource.isLinkBased
              ? 'Materiala keçid link vasitəsilə açılır.'
              : 'Dərsdə çap edilmiş şəkildə və ya ekranda işlədilə bilər.'}
          </p>

          {/* Pulsuz video/linkdə `externalUrl` dolu gəlir — dərhal embed olunur.
              Ödənişli video satın alınmayıbsa backend linki gizlədir (null). */}
          {resource.externalUrl && (
            <VideoEmbed url={resource.externalUrl} title={resource.name} />
          )}

          {resource.isLinkBased && resource.isPaid && !resource.externalUrl && (
            <p className="mt-4 rounded-xl bg-brand-chipBg px-4 py-3 text-sm text-brand-slate">
              Bu video dərsin linki satın aldıqdan sonra açılır.
            </p>
          )}

          {resource.status === 'Rejected' && resource.rejectionReason && (
            <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
              Rədd səbəbi: {resource.rejectionReason}
            </p>
          )}

          <dl className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <dt className="text-[13px] text-brand-muted">Fənn</dt>
              <dd className="mt-1 font-heading font-semibold text-brand-navy">
                {resource.subject}
              </dd>
            </div>
            <div className="card p-4">
              <dt className="text-[13px] text-brand-muted">Sinif</dt>
              <dd className="mt-1 font-heading font-semibold text-brand-navy">
                {resource.grade}-ci sinif
              </dd>
            </div>
            <div className="card p-4">
              <dt className="text-[13px] text-brand-muted">Tip</dt>
              <dd className="mt-1 font-heading font-semibold text-brand-navy">
                {resourceTypeLabel(resource.type)}
              </dd>
            </div>
            <div className="card p-4">
              <dt className="text-[13px] text-brand-muted">
                {resource.isLinkBased ? 'Baxış' : 'Endirmə'}
              </dt>
              <dd className="mt-1 font-heading font-semibold text-brand-navy">
                {formatNumber(resource.downloads)}
              </dd>
            </div>
          </dl>

          {quiz && (
            <section className="card mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-brand-navy">
                    İmtahan
                  </h2>
                  <p className="mt-1 text-sm text-brand-muted">
                    {quiz.questionCount} sual · keçid balı {quiz.passPercent}%
                  </p>
                </div>
                {passed ? (
                  <div className="flex items-center gap-3">
                    <StatusBadge tone="free">İmtahan keçilib</StatusBadge>
                    <Button variant="secondary" size="sm" onClick={startQuiz}>
                      Yenidən keç
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={startQuiz}>
                    İmtahana başla
                  </Button>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="card">
            <p className="font-heading text-3xl font-bold text-brand-navy">
              {resource.isPaid ? `${resource.price} ₼` : 'Pulsuz'}
            </p>

            {resource.isPurchased && (
              <p className="mt-2">
                <StatusBadge tone="free">Alınıb</StatusBadge>
              </p>
            )}

            {/* canAccess: pulsuzdur, alınıb və ya sizinkidir. */}
            {resource.canAccess ? (
              <Button
                className="mt-5"
                fullWidth
                disabled={busy}
                onClick={() => download(resourceId)}
              >
                {resource.type === 'Video'
                  ? 'İzlə'
                  : resource.isLinkBased
                    ? 'Materialı aç'
                    : 'Endir'}
              </Button>
            ) : (
              <Button
                className="mt-5"
                fullWidth
                disabled={busy}
                onClick={() => add('Resource', resourceId)}
              >
                Səbətə əlavə et
              </Button>
            )}
          </div>

          <Link
            to={`/muellif/${resource.authorId}`}
            className="card card-hover flex items-center gap-3"
          >
            <Avatar name={resource.authorName} />
            <span className="min-w-0">
              <span className="block truncate font-heading font-semibold text-brand-navy">
                {resource.authorName}
              </span>
              <span className="block text-xs text-brand-faint">
                {resource.authorSubject
                  ? `${resource.authorSubject} müəllimi`
                  : 'MIMEDU müəllifi'}
              </span>
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
