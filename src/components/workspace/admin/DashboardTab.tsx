import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../api';
import { apiErrorMessage } from '../../../hooks/useApiError';
import { ErrorNote } from '../../ui/ErrorNote';
import { Spinner } from '../../ui/Spinner';
import { StatCard } from '../../ui/StatCard';
import { formatDateTime, formatNumber, formatPrice } from '../../../lib/format';
import type { AdminDashboard } from '../../../types';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="font-heading text-base font-bold text-brand-navy">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

export default function DashboardTab() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .dashboard()
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, 'İcmal yüklənmədi.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!data) return null;

  const { traffic, content, trainings, sales, exams } = data;

  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">İcmal</h2>
      <p className="mt-1.5 text-sm text-brand-muted">
        Son yenilənmə: {formatDateTime(data.generatedAt)}
      </p>

      <Section title="Satış">
        <StatCard label="GMV" value={formatPrice(sales.gmv)} />
        <StatCard label="Platforma komissiyası" value={formatPrice(sales.commissionTotal)} />
        <StatCard label="Müəlliflərə ödəniş" value={formatPrice(sales.authorPayoutTotal)} />
        <StatCard label="Ödənilmiş sifariş" value={formatNumber(sales.paidOrders)} />
      </Section>

      <Section title="Məzmun">
        <StatCard label="İstifadəçi" value={formatNumber(content.totalUsers)} />
        <StatCard label="Resurs" value={formatNumber(content.totalResources)} />
        <StatCard label="Moderasiyada" value={formatNumber(content.pendingResources)} />
        <StatCard label="Ümumi endirmə" value={formatNumber(content.totalDownloads)} />
        <StatCard label="Təsdiqlənmiş" value={formatNumber(content.approvedResources)} />
        <StatCard label="Rədd edilmiş" value={formatNumber(content.rejectedResources)} />
        <StatCard label="Bloq yazısı" value={formatNumber(content.blogPosts)} />
        <StatCard label="Sertifikat" value={formatNumber(content.issuedCertificates)} />
      </Section>

      <Section title="Təlimlər">
        <StatCard label="Təlim sayı" value={formatNumber(trainings.totalTrainings)} />
        <StatCard label="Dərs sayı" value={formatNumber(trainings.totalLessons)} />
        <StatCard label="Qeydiyyat" value={formatNumber(trainings.totalEnrollments)} />
        <StatCard label="Tamamlanmış" value={formatNumber(trainings.completedEnrollments)} />
        <StatCard label="Canlı" value={formatNumber(trainings.liveTrainings)} />
        <StatCard label="Onlayn" value={formatNumber(trainings.onlineTrainings)} />
        <StatCard label="Video" value={formatNumber(trainings.videoTrainings)} />
        <StatCard label="Təlim gəliri" value={formatPrice(trainings.trainingRevenue)} />
      </Section>

      <Section title="Sınaqlar">
        <StatCard label="Sınaq sayı" value={formatNumber(exams.totalExams)} />
        <StatCard label="Moderasiyada" value={formatNumber(exams.pendingExams)} />
        <StatCard label="Sual sayı" value={formatNumber(exams.totalQuestions)} />
        <StatCard label="Cəhd sayı" value={formatNumber(exams.totalAttempts)} />
        <StatCard label="Davam edən" value={formatNumber(exams.attemptsInProgress)} />
        <StatCard label="Keçən cəhd" value={formatNumber(exams.passedAttempts)} />
        <StatCard label="Orta bal" value={`${Math.round(exams.averageScorePercent)}%`} />
        <StatCard label="Sınaq gəliri" value={formatPrice(exams.examRevenue)} />
      </Section>

      <Section title="Trafik">
        <StatCard label="Ümumi sorğu" value={formatNumber(traffic.totalRequests)} />
        <StatCard label="Son 24 saat" value={formatNumber(traffic.requestsLast24Hours)} />
        <StatCard
          label="Xəta faizi"
          value={`${traffic.errorRatePercent.toFixed(1)}%`}
        />
        <StatCard
          label="Orta cavab müddəti"
          value={`${Math.round(traffic.averageDurationMs)} ms`}
        />
        <StatCard label="4xx" value={formatNumber(traffic.clientErrors)} />
        <StatCard label="5xx" value={formatNumber(traffic.serverErrors)} />
        <StatCard
          label="5xx (24 saat)"
          value={formatNumber(traffic.serverErrorsLast24Hours)}
        />
        <StatCard label="Uğursuz sorğu" value={formatNumber(traffic.failedRequests)} />
      </Section>

      {data.topTrainings.length > 0 && (
        <section className="mt-8">
          <h3 className="font-heading text-base font-bold text-brand-navy">
            Ən çox yazılan təlimlər
          </h3>
          <ul className="card mt-3 !p-0">
            {data.topTrainings.map((item) => (
              <li
                key={item.trainingId}
                className="flex flex-wrap items-center gap-3 border-b border-brand-borderLight px-5 py-3.5 last:border-b-0"
              >
                <Link
                  to={`/telimler/${item.trainingId}`}
                  className="min-w-0 flex-1 truncate font-heading text-sm font-semibold text-brand-navy hover:text-brand-blue"
                >
                  {item.name}
                </Link>
                <span className="text-sm text-brand-muted">
                  {formatNumber(item.enrollmentCount)} qeydiyyat
                </span>
                <span className="font-heading text-sm font-bold text-brand-navy">
                  {formatPrice(item.revenue)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.topErrors.length > 0 && (
        <section className="mt-8">
          <h3 className="font-heading text-base font-bold text-brand-navy">
            Ən çox təkrarlanan xətalar
          </h3>
          <ul className="card mt-3 !p-0">
            {data.topErrors.map((item, index) => (
              <li
                key={`${item.method}-${item.path}-${item.statusCode}-${index}`}
                className="flex flex-wrap items-center gap-3 border-b border-brand-borderLight px-5 py-3.5 last:border-b-0"
              >
                <span className="font-heading text-xs font-bold text-danger-text">
                  {item.statusCode}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-brand-ink">
                  <span className="font-heading font-semibold">{item.method}</span>{' '}
                  {item.path}
                </span>
                <span className="text-sm text-brand-muted">{formatNumber(item.count)} dəfə</span>
                <span className="text-xs text-brand-faint">
                  {formatDateTime(item.lastOccurredAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
