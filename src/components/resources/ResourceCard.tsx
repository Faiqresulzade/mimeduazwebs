import { Link } from 'react-router-dom';
import type { Resource } from '../../types';
import { formatNumber, resourceTypeLabel } from '../../lib/format';
import { PriceBadge, StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ResourceCardProps {
  resource: Resource;
  /** İstifadəçi bu resursun imtahanını keçibsə fərqli badge göstərilir. */
  quizPassed?: boolean;
  showQuizState?: boolean;
  busy?: boolean;
  onAddToCart: () => void;
  onDownload: () => void;
}

export function ResourceCard({
  resource,
  quizPassed = false,
  showQuizState = false,
  busy = false,
  onAddToCart,
  onDownload,
}: ResourceCardProps) {
  return (
    <article className="card card-hover flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="neutral">{resourceTypeLabel(resource.type)}</StatusBadge>
        <PriceBadge isPaid={resource.isPaid} price={resource.price} />
        {resource.isPurchased && <StatusBadge tone="free">Alınıb</StatusBadge>}
        {resource.hasQuiz && (
          <StatusBadge tone={showQuizState && quizPassed ? 'free' : 'info'}>
            {showQuizState && quizPassed ? 'İmtahan keçilib' : 'İmtahan var'}
          </StatusBadge>
        )}
      </div>

      <h3 className="mt-4 font-heading text-base font-semibold leading-snug text-brand-navy">
        <Link to={`/resurslar/${resource.id}`} className="hover:text-brand-blue">
          {resource.name}
        </Link>
      </h3>

      <p className="mt-2 text-sm text-brand-muted">
        {resource.subject} · {resource.grade}-ci sinif
      </p>

      <Link
        to={`/muellif/${resource.authorId}`}
        className="mt-4 flex items-center gap-2.5 text-sm text-brand-slate hover:text-brand-blue"
      >
        <Avatar name={resource.authorName} size="sm" />
        <span className="truncate font-medium">{resource.authorName}</span>
      </Link>

      <p className="mt-3 flex-1 text-xs text-brand-faint">
        {formatNumber(resource.downloads)} {resource.isLinkBased ? 'baxış' : 'endirmə'}
      </p>

      <div className="mt-5 border-t border-brand-borderLight pt-4">
        {/* canAccess: pulsuzdur, alınıb və ya sizinkidir — "Səbətə at" yalnız tərsində. */}
        {resource.canAccess ? (
          <Button size="sm" variant="secondary" fullWidth disabled={busy} onClick={onDownload}>
            {resource.type === 'Video'
              ? resource.isPaid
                ? 'İzlə'
                : 'Pulsuz izlə'
              : resource.isLinkBased
                ? resource.isPaid
                  ? 'Materialı aç'
                  : 'Pulsuz aç'
                : resource.isPaid
                  ? 'Endir'
                  : 'Pulsuz endir'}
          </Button>
        ) : (
          <Button size="sm" fullWidth disabled={busy} onClick={onAddToCart}>
            Səbətə əlavə et
          </Button>
        )}
      </div>
    </article>
  );
}
