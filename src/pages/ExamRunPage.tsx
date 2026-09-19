import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { examsApi } from '../api';
import { apiErrorMessage } from '../hooks/useApiError';
import { useToast } from '../hooks/useToast';
import { formatCountdown, useExamCountdown } from '../hooks/useExamCountdown';
import { ExamQuestionCard } from '../components/exams/ExamQuestionCard';
import { Button } from '../components/ui/Button';
import { ErrorNote } from '../components/ui/ErrorNote';
import { Spinner } from '../components/ui/Spinner';
import type { ExamRun } from '../types';

/** Sayğac bu həddin altına düşəndə qırmızı göstərilir. */
const WARNING_SECONDS = 60;

export default function ExamRunPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [run, setRun] = useState<ExamRun | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // `start` idempotentdir — səhifə yenilənsə eyni cəhd qayıdır, vaxt sıfırlanmır.
    examsApi
      .start(id)
      .then((data) => !cancelled && setRun(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Sınaq açılmadı.')))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const submit = useCallback(
    async (auto: boolean) => {
      if (!run || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);

      try {
        const allQuestions = run.sections.flatMap((section) => section.questions);
        const payload = allQuestions.map((question) => ({
          questionId: question.id,
          // Cavabsız sual üçün null — backend səhv sayır.
          selectedIndex: answers[question.id] ?? null,
        }));

        const result = await examsApi.submit(run.attemptId, payload);
        if (auto) toast('Vaxt bitdi — cavablar göndərildi.');
        navigate(`/sinaq-neticesi/${result.attemptId}`, { replace: true });
      } catch (err) {
        submittedRef.current = false;
        toast(apiErrorMessage(err, 'Cavablar göndərilmədi.'));
        setSubmitting(false);
      }
    },
    [run, answers, navigate, toast],
  );

  const handleExpire = useCallback(() => {
    void submit(true);
  }, [submit]);

  const remaining = useExamCountdown(run?.remainingSeconds ?? null, handleExpire);

  if (loading) return <Spinner />;

  if (error || !run) {
    return (
      <div className="shell py-14">
        <ErrorNote message={error ?? 'Sınaq açılmadı.'} />
        <Link
          to={`/sinaqlar/${id}`}
          className="mt-4 inline-block text-sm font-semibold text-brand-blue"
        >
          &larr; Sınağa qayıt
        </Link>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const urgent = remaining <= WARNING_SECONDS;
  let questionNumber = 0;

  return (
    <div className="shell max-w-3xl py-10 sm:py-14">
      <header>
        <h1 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
          {run.examName}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">
          {run.questionCount} sual · {run.durationMinutes} dəqiqə
        </p>
      </header>

      {/* Sayğac backend-in `remainingSeconds` dəyərindən qurulur, lokal saatdan yox. */}
      <div
        className={`sticky top-20 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4 ${
          urgent
            ? 'border-danger-text bg-danger-bg'
            : 'border-brand-border bg-brand-surface'
        }`}
      >
        <span className="text-sm text-brand-slate">
          {answeredCount} / {run.questionCount} cavablandı
        </span>
        <span
          role="timer"
          aria-live={urgent ? 'assertive' : 'off'}
          className={`font-heading text-2xl font-bold tabular-nums ${
            urgent ? 'text-danger-text' : 'text-brand-navy'
          }`}
        >
          {formatCountdown(remaining)}
        </span>
      </div>

      <div className="mt-6 space-y-8">
        {run.sections
          .slice()
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((section) => (
            <section key={section.id}>
              <h2 className="font-heading text-lg font-bold text-brand-navy">
                {section.subject}
              </h2>
              <div className="mt-3 space-y-4">
                {section.questions
                  .slice()
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question) => {
                    const index = questionNumber++;
                    return (
                      <ExamQuestionCard
                        key={question.id}
                        index={index}
                        questionText={question.questionText}
                        imageUrl={question.imageUrl}
                        options={question.options}
                        selectedIndex={answers[question.id] ?? null}
                        disabled={submitting}
                        onSelect={(optionIndex) =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex,
                          }))
                        }
                      />
                    );
                  })}
              </div>
            </section>
          ))}
      </div>

      <div className="sticky bottom-4 mt-8">
        <Button fullWidth disabled={submitting} onClick={() => submit(false)}>
          {submitting ? 'Göndərilir…' : 'Sınağı bitir və təqdim et'}
        </Button>
        {answeredCount < run.questionCount && (
          <p className="mt-2 text-center text-xs text-brand-faint">
            Cavablanmamış suallar səhv sayılacaq.
          </p>
        )}
      </div>
    </div>
  );
}
