import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examsApi } from '../api';
import { apiErrorMessage } from '../hooks/useApiError';
import { useAddToCart } from '../hooks/useAddToCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Avatar } from '../components/ui/Avatar';
import { PriceBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorNote } from '../components/ui/ErrorNote';
import { Spinner } from '../components/ui/Spinner';
import { formatNumber } from '../lib/format';
import type { ExamDetail } from '../types';

export default function ExamDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { add, pendingId } = useAddToCart();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    examsApi
      .get(id)
      .then((data) => !cancelled && setExam(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Sınaq tapılmadı.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function start() {
    if (!isAuthenticated) {
      toast('Sınaq üçün hesaba daxil olun.');
      navigate('/giris');
      return;
    }

    setStarting(true);
    try {
      // Təkrar çağırmaq təhlükəsizdir — eyni cəhd qayıdır, vaxt sıfırlanmır.
      const run = await examsApi.start(id);
      navigate(`/sinaqlar/${id}/cehd/${run.attemptId}`);
    } catch (err) {
      toast(apiErrorMessage(err, 'Sınaq başlamadı.'));
    } finally {
      setStarting(false);
    }
  }

  if (loading) return <Spinner />;

  if (error || !exam) {
    return (
      <div className="shell py-14">
        <ErrorNote message={error ?? 'Sınaq tapılmadı.'} />
        <Link to="/sinaqlar" className="mt-4 inline-block text-sm font-semibold text-brand-blue">
          &larr; Bütün sınaqlar
        </Link>
      </div>
    );
  }

  const attempt = exam.myAttempt;

  return (
    <div className="shell py-10 sm:py-14">
      <Link to="/sinaqlar" className="text-sm font-semibold text-brand-blue">
        &larr; Bütün sınaqlar
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="info">{exam.durationMinutes} dəqiqə</StatusBadge>
            <PriceBadge isPaid={exam.isPaid} price={exam.price} />
            {exam.status !== 'Approved' && (
              <StatusBadge tone={exam.status === 'Pending' ? 'info' : 'danger'}>
                {exam.status === 'Pending' ? 'Moderasiyada' : 'Rədd edilib'}
              </StatusBadge>
            )}
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-brand-navy">
            {exam.name}
          </h1>

          {exam.description && (
            <p className="mt-4 text-base leading-relaxed text-brand-ink">
              {exam.description}
            </p>
          )}

          {exam.status === 'Rejected' && exam.rejectionReason && (
            <p className="mt-4 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
              Rədd səbəbi: {exam.rejectionReason}
            </p>
          )}

          <section className="mt-10">
            <h2 className="font-heading text-xl font-bold text-brand-navy">Bölmələr</h2>
            <ol className="mt-4 space-y-3">
              {exam.sections
                .slice()
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((section, index) => (
                  <li key={section.id} className="card flex items-center gap-4 p-4">
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-online-bg font-heading text-[13px] font-bold text-brand-blueDark">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1 font-heading text-[15px] font-semibold text-brand-navy">
                      {section.subject}
                    </span>
                    <span className="text-sm text-brand-muted">
                      {section.questionCount} sual
                    </span>
                  </li>
                ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="card">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-brand-muted">Vaxt limiti</dt>
                <dd className="font-medium text-brand-ink">{exam.durationMinutes} dəqiqə</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-brand-muted">Sual sayı</dt>
                <dd className="font-medium text-brand-ink">{exam.questionCount}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-brand-muted">Keçid balı</dt>
                <dd className="font-medium text-brand-ink">{exam.passPercent}%</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-brand-muted">Cəhd sayı</dt>
                <dd className="font-medium text-brand-ink">
                  {formatNumber(exam.attemptCount)}
                </dd>
              </div>
            </dl>

            <div className="mt-5 border-t border-brand-borderLight pt-5">
              {attempt && attempt.status !== 'InProgress' ? (
                <>
                  <p className="mb-3 text-sm text-brand-slate">
                    Bu sınağı vermisiniz — nəticə: <strong>{attempt.scorePercent}%</strong>
                  </p>
                  <Link to={`/sinaq-neticesi/${attempt.id}`}>
                    <Button fullWidth>Nəticəyə bax</Button>
                  </Link>
                </>
              ) : attempt ? (
                <>
                  <p className="mb-3 text-sm text-brand-slate">
                    Başlanmış cəhdiniz var — vaxt işləyir.
                  </p>
                  <Button fullWidth disabled={starting} onClick={start}>
                    {starting ? 'Açılır…' : 'Davam et'}
                  </Button>
                </>
              ) : exam.canAccess ? (
                <>
                  <Button fullWidth disabled={starting} onClick={start}>
                    {starting ? 'Başlayır…' : 'Sınağa başla'}
                  </Button>
                  <p className="mt-3 text-xs leading-relaxed text-brand-faint">
                    Başladıqdan sonra sayğac dayanmır. Bir sınaq bir dəfə verilir.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-heading text-3xl font-bold text-brand-navy">
                    {exam.price} ₼
                  </p>
                  <Button
                    className="mt-4"
                    fullWidth
                    disabled={pendingId === exam.id}
                    onClick={() => add('Exam', exam.id)}
                  >
                    Səbətə əlavə et
                  </Button>
                </>
              )}
            </div>
          </div>

          <Link
            to={`/muellif/${exam.authorId}`}
            className="card card-hover flex items-center gap-3"
          >
            <Avatar name={exam.authorName} />
            <span className="min-w-0">
              <span className="block truncate font-heading font-semibold text-brand-navy">
                {exam.authorName}
              </span>
              <span className="block text-xs text-brand-faint">Sınağın müəllifi</span>
            </span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
