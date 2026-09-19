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
import type { ExamDetail } from '../../../types';

export default function AdminExamsTab() {
  const { toast } = useToast();
  const [pending, setPending] = useState<ExamDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    let cancelled = false;
    adminApi
      .pendingExams()
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
      await adminApi.approveExam(id);
      setPending((current) => current.filter((item) => item.id !== id));
      toast('Sınaq təsdiqləndi və satışa çıxdı.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Təsdiq alınmadı.'));
    } finally {
      setBusyId(null);
    }
  }

  async function reject(id: string) {
    setBusyId(id);
    try {
      await adminApi.rejectExam(id, reason.trim() || undefined);
      setPending((current) => current.filter((item) => item.id !== id));
      setRejectingId(null);
      setReason('');
      toast('Sınaq rədd edildi.');
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
      <h2 className="font-heading text-xl font-bold text-brand-navy">Sınaq moderasiyası</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Gözləyən {pending.length} sınaq. Təsdiqlənən sınaq dərhal kataloqda görünür.
      </p>

      <div className="mt-5">
        {pending.length === 0 ? (
          <EmptyState
            title="Sınaq növbəsi boşdur"
            text="Müəllim yeni sınaq yaratdıqda burada görünəcək."
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((exam) => (
              <li key={exam.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-heading text-[15px] font-semibold text-brand-navy">
                      <Link to={`/sinaqlar/${exam.id}`} className="hover:text-brand-blue">
                        {exam.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {exam.authorName} · {exam.subject}
                      {exam.grade !== null && ` · ${exam.grade}-ci sinif`}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {exam.questionCount} sual · {exam.sectionCount} bölmə ·{' '}
                      {exam.durationMinutes} dəq · keçid balı {exam.passPercent}%
                    </p>
                    {exam.description && (
                      <p className="mt-2 text-sm leading-relaxed text-brand-ink">
                        {exam.description}
                      </p>
                    )}
                    {exam.sections.length > 0 && (
                      <p className="mt-2 text-xs text-brand-faint">
                        Bölmələr:{' '}
                        {exam.sections
                          .map((section) => `${section.subject} (${section.questionCount})`)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <PriceBadge isPaid={exam.isPaid} price={exam.price} />
                </div>

                {rejectingId === exam.id ? (
                  <div className="mt-4 rounded-xl bg-danger-bg p-4">
                    <Input
                      name={`exam-reason-${exam.id}`}
                      label="Rədd səbəbi (istəyə bağlı)"
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Suallar kurikuluma uyğun deyil."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={busyId === exam.id}
                        onClick={() => reject(exam.id)}
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
                      disabled={busyId === exam.id}
                      onClick={() => approve(exam.id)}
                    >
                      Təsdiqlə
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={busyId === exam.id}
                      onClick={() => setRejectingId(exam.id)}
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
