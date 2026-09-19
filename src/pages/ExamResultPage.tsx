import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { examsApi } from '../api';
import { apiErrorMessage } from '../hooks/useApiError';
import { ExamQuestionCard } from '../components/exams/ExamQuestionCard';
import { CertificateDownloadLinks } from '../components/certificates/CertificateDownloadLinks';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorNote } from '../components/ui/ErrorNote';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Spinner } from '../components/ui/Spinner';
import { formatCountdown } from '../hooks/useExamCountdown';
import type { ExamResult } from '../types';

export default function ExamResultPage() {
  const { attemptId = '' } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    examsApi
      .result(attemptId)
      .then((data) => !cancelled && setResult(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'Nəticə tapılmadı.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (loading) return <Spinner />;

  if (error || !result) {
    return (
      <div className="shell py-14">
        <ErrorNote message={error ?? 'Nəticə tapılmadı.'} />
        <Link to="/sinaqlar" className="mt-4 inline-block text-sm font-semibold text-brand-blue">
          &larr; Bütün sınaqlar
        </Link>
      </div>
    );
  }

  const expired = result.status === 'Expired';
  let questionNumber = 0;

  return (
    <div className="shell max-w-3xl py-10 sm:py-14">
      <Link
        to={`/sinaqlar/${result.examId}`}
        className="text-sm font-semibold text-brand-blue"
      >
        &larr; {result.examName}
      </Link>

      <div
        className={`card mt-6 ${
          result.passed ? 'border-free-text' : expired ? 'border-danger-text' : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className={`font-heading text-4xl font-bold ${
                result.passed ? 'text-free-text' : 'text-danger-text'
              }`}
            >
              {result.scorePercent}%
            </p>
            <p className="mt-1 text-sm text-brand-muted">
              {result.correctCount} / {result.questionCount} doğru cavab · keçid balı{' '}
              {result.passPercent}%
            </p>
          </div>
          <StatusBadge tone={result.passed ? 'free' : 'danger'}>
            {expired ? 'Vaxt bitdi' : result.passed ? 'Keçdiniz' : 'Keçmədiniz'}
          </StatusBadge>
        </div>

        <p className="mt-4 text-xs text-brand-faint">
          Sərf olunan vaxt: {formatCountdown(result.elapsedSeconds)}
        </p>

        {result.certificateCode && (
          <div className="mt-5 rounded-xl bg-free-bg p-4">
            <p className="text-sm font-medium text-free-text">
              Sertifikat kodunuz: <strong>{result.certificateCode}</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CertificateDownloadLinks code={result.certificateCode} />
            </div>
          </div>
        )}
      </div>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-brand-navy">Fənn üzrə nəticə</h2>
        <div className="mt-4 space-y-4">
          {result.sections.map((section) => (
            <div key={section.sectionId} className="card">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-heading font-semibold text-brand-navy">
                  {section.subject}
                </span>
                <span className="text-brand-muted">
                  {section.correctCount} / {section.questionCount} ·{' '}
                  <strong className="text-brand-navy">{section.scorePercent}%</strong>
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={section.scorePercent} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-bold text-brand-navy">Cavab açarı</h2>
        <div className="mt-4 space-y-8">
          {result.sections.map((section) => (
            <div key={section.sectionId}>
              <h3 className="font-heading text-base font-bold text-brand-slate">
                {section.subject}
              </h3>
              <div className="mt-3 space-y-4">
                {section.questions
                  .slice()
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((question) => {
                    const index = questionNumber++;
                    return (
                      <ExamQuestionCard
                        key={question.questionId}
                        index={index}
                        questionText={question.questionText}
                        imageUrl={question.imageUrl}
                        options={question.options}
                        selectedIndex={question.selectedIndex}
                        correctOptionIndex={question.correctOptionIndex}
                        disabled
                      />
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link to="/sinaqlar">
          <Button variant="secondary">Bütün sınaqlar</Button>
        </Link>
      </div>
    </div>
  );
}
