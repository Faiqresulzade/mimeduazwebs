import { Link } from 'react-router-dom';
import type { Exam } from '../../types';
import { formatNumber, formatPrice } from '../../lib/format';
import { PriceBadge, StatusBadge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';

interface ExamCardProps {
  exam: Exam;
  busy?: boolean;
  onAddToCart: () => void;
}

export function ExamCard({ exam, busy = false, onAddToCart }: ExamCardProps) {
  return (
    <article className="card card-hover flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="info">{exam.durationMinutes} dəq</StatusBadge>
        <PriceBadge isPaid={exam.isPaid} price={exam.price} />
        {exam.isPurchased && <StatusBadge tone="free">Alınıb</StatusBadge>}
      </div>

      <h3 className="mt-4 font-heading text-base font-semibold leading-snug text-brand-navy">
        <Link to={`/sinaqlar/${exam.id}`} className="hover:text-brand-blue">
          {exam.name}
        </Link>
      </h3>

      <p className="mt-2 text-sm text-brand-muted">
        {exam.subject}
        {exam.grade !== null && ` · ${exam.grade}-ci sinif`}
      </p>

      <Link
        to={`/muellif/${exam.authorId}`}
        className="mt-4 flex items-center gap-2.5 text-sm text-brand-slate hover:text-brand-blue"
      >
        <Avatar name={exam.authorName} size="sm" />
        <span className="truncate font-medium">{exam.authorName}</span>
      </Link>

      <p className="mt-3 flex-1 text-xs text-brand-faint">
        {exam.questionCount} sual · keçid balı {exam.passPercent}% ·{' '}
        {formatNumber(exam.attemptCount)} cəhd
      </p>

      <div className="mt-5 border-t border-brand-borderLight pt-4">
        {exam.canAccess ? (
          <Link to={`/sinaqlar/${exam.id}`}>
            <Button size="sm" fullWidth>
              Sınağa başla
            </Button>
          </Link>
        ) : (
          <Button size="sm" fullWidth disabled={busy} onClick={onAddToCart}>
            Səbətə əlavə et · {formatPrice(exam.price)}
          </Button>
        )}
      </div>
    </article>
  );
}
