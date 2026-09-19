import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { examsApi } from '../api';
import { apiErrorMessage } from '../hooks/useApiError';
import { useAddToCart } from '../hooks/useAddToCart';
import { ExamCard } from '../components/exams/ExamCard';
import { Chip } from '../components/ui/Chip';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorNote } from '../components/ui/ErrorNote';
import { Spinner } from '../components/ui/Spinner';
import { ALL_FILTER, ALL_GRADES, SUBJECTS } from '../lib/constants';
import type { Exam } from '../types';

const PAGE_SIZE = 100;

export default function ExamsPage() {
  const [params, setParams] = useSearchParams();
  const { add, pendingId } = useAddToCart();

  const subject = params.get('fenn') ?? ALL_FILTER;
  const grade = params.get('sinif') ?? ALL_GRADES;

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    examsApi
      .list({ pageSize: PAGE_SIZE })
      .then((data) => !cancelled && setExams(data.items))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Sınaqlar yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const availableGrades = useMemo(
    () =>
      [...new Set(exams.map((item) => item.grade).filter((g): g is number => g !== null))].sort(
        (a, b) => a - b,
      ),
    [exams],
  );

  const filtered = useMemo(
    () =>
      exams.filter(
        (item) =>
          (subject === ALL_FILTER || item.subject === subject) &&
          (grade === ALL_GRADES || String(item.grade) === grade),
      ),
    [exams, subject, grade],
  );

  function updateFilter(key: string, value: string, defaultValue: string) {
    const next = new URLSearchParams(params);
    if (value === defaultValue) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <div className="shell py-10 sm:py-14">
      <header className="max-w-2xl">
        <h1 className="font-heading text-3xl font-bold text-brand-navy">Sınaqlar</h1>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">
          Müəllimlərin hazırladığı vaxt limitli sınaq imtahanları. Nəticə fənn üzrə
          ayrıca göstərilir, keçid balından yuxarı nəticəyə sertifikat verilir.
        </p>
      </header>

      <div className="card mt-8">
        <span className="font-heading text-[11px] font-bold uppercase tracking-[.08em] text-brand-faint">
          Fənn
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          <Chip
            active={subject === ALL_FILTER}
            onClick={() => updateFilter('fenn', ALL_FILTER, ALL_FILTER)}
          >
            {ALL_FILTER}
          </Chip>
          {SUBJECTS.map((item) => (
            <Chip
              key={item}
              active={subject === item}
              onClick={() => updateFilter('fenn', item, ALL_FILTER)}
            >
              {item}
            </Chip>
          ))}
        </div>

        {availableGrades.length > 0 && (
          <>
            <span className="mt-5 block font-heading text-[11px] font-bold uppercase tracking-[.08em] text-brand-faint">
              Sinif
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              <Chip
                active={grade === ALL_GRADES}
                onClick={() => updateFilter('sinif', ALL_GRADES, ALL_GRADES)}
              >
                {ALL_GRADES}
              </Chip>
              {availableGrades.map((item) => (
                <Chip
                  key={item}
                  active={grade === String(item)}
                  onClick={() => updateFilter('sinif', String(item), ALL_GRADES)}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </>
        )}

        <p className="mt-4 border-t border-brand-borderLight pt-4 text-sm text-brand-slate">
          {subject === ALL_FILTER ? 'Bütün fənlər' : subject} ·{' '}
          {grade === ALL_GRADES ? 'bütün siniflər' : `${grade}-ci sinif`} ·{' '}
          {filtered.length} sınaq
        </p>
      </div>

      <div className="mt-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorNote message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Bu filtrə uyğun sınaq tapılmadı"
            text="Fənn və ya sinif seçimini dəyişib yenidən yoxlayın."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                busy={pendingId === exam.id}
                onAddToCart={() => add('Exam', exam.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
