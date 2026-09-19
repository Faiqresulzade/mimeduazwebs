import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { Spinner } from './components/ui/Spinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const TrainingsPage = lazy(() => import('./pages/TrainingsPage'));
const TrainingDetailPage = lazy(() => import('./pages/TrainingDetailPage'));
const TrainingLessonsPage = lazy(() => import('./pages/TrainingLessonsPage'));
const ExamsPage = lazy(() => import('./pages/ExamsPage'));
const ExamDetailPage = lazy(() => import('./pages/ExamDetailPage'));
const ExamRunPage = lazy(() => import('./pages/ExamRunPage'));
const ExamResultPage = lazy(() => import('./pages/ExamResultPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const ResourceDetailPage = lazy(() => import('./pages/ResourceDetailPage'));
const AuthorPage = lazy(() => import('./pages/AuthorPage'));
const PromptsPage = lazy(() => import('./pages/PromptsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const CertificateVerifyPage = lazy(() => import('./pages/CertificateVerifyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const TeacherPanelPage = lazy(() => import('./pages/TeacherPanelPage'));
const MyTrainingsTab = lazy(() => import('./components/workspace/teacher/MyTrainingsTab'));
const MyResourcesTab = lazy(() => import('./components/workspace/teacher/MyResourcesTab'));
const UploadTab = lazy(() => import('./components/workspace/teacher/UploadTab'));
const QuizBuilderTab = lazy(() => import('./components/workspace/teacher/QuizBuilderTab'));
const MyCertificatesTab = lazy(
  () => import('./components/workspace/teacher/MyCertificatesTab'),
);
const EarningsTab = lazy(() => import('./components/workspace/teacher/EarningsTab'));
const ExamBuilderTab = lazy(() => import('./components/workspace/teacher/ExamBuilderTab'));
const PurchasedTab = lazy(() => import('./components/workspace/teacher/PurchasedTab'));

const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const ModerationTab = lazy(() => import('./components/workspace/admin/ModerationTab'));
const AdminTrainingsTab = lazy(
  () => import('./components/workspace/admin/AdminTrainingsTab'),
);
const UsersTab = lazy(() => import('./components/workspace/admin/UsersTab'));
const SalesTab = lazy(() => import('./components/workspace/admin/SalesTab'));
const AdminCertificatesTab = lazy(
  () => import('./components/workspace/admin/AdminCertificatesTab'),
);
const DashboardTab = lazy(() => import('./components/workspace/admin/DashboardTab'));
const AdminExamsTab = lazy(() => import('./components/workspace/admin/AdminExamsTab'));
const LogsTab = lazy(() => import('./components/workspace/admin/LogsTab'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Publik səhifələr */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="telimler" element={<TrainingsPage />} />
          <Route path="telimler/:id" element={<TrainingDetailPage />} />
          <Route path="sinaqlar" element={<ExamsPage />} />
          <Route path="sinaqlar/:id" element={<ExamDetailPage />} />
          <Route path="resurslar" element={<ResourcesPage />} />
          <Route path="resurslar/:id" element={<ResourceDetailPage />} />
          <Route path="muellif/:id" element={<AuthorPage />} />
          <Route path="promptlar" element={<PromptsPage />} />
          <Route path="haqqimizda" element={<AboutPage />} />
          <Route path="blog/:id" element={<BlogPostPage />} />
          {/* Sertifikatdakı QR kodun hədəfi — publikdir. */}
          <Route path="sertifikat-yoxla/:code" element={<CertificateVerifyPage />} />

          {/* Yalnız qonaq */}
          <Route element={<GuestRoute />}>
            <Route path="giris" element={<AuthPage />} />
          </Route>

          {/* Yalnız login */}
          <Route element={<ProtectedRoute />}>
            <Route path="sebet" element={<CartPage />} />
            <Route path="sifarisler" element={<OrdersPage />} />
          </Route>
          <Route element={<ProtectedRoute message="İmtahan üçün hesaba daxil olun" />}>
            <Route path="imtahan/:resourceId" element={<QuizPage />} />
          </Route>
          {/* Dərslər yalnız təlimə yazılanlara açıqdır — backend 403 qaytarır. */}
          <Route element={<ProtectedRoute message="Dərslər üçün hesaba daxil olun" />}>
            <Route path="telimler/:id/dersler" element={<TrainingLessonsPage />} />
          </Route>
          <Route element={<ProtectedRoute message="Sınaq üçün hesaba daxil olun" />}>
            <Route path="sinaqlar/:id/cehd/:attemptId" element={<ExamRunPage />} />
            <Route path="sinaq-neticesi/:attemptId" element={<ExamResultPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Müəllim paneli */}
        <Route element={<ProtectedRoute role="Teacher" />}>
          <Route path="panel" element={<TeacherPanelPage />}>
            <Route index element={<Navigate to="telimlerim" replace />} />
            <Route path="telimlerim" element={<MyTrainingsTab />} />
            <Route path="aldiqlarim" element={<PurchasedTab />} />
            <Route path="resurslarim" element={<MyResourcesTab />} />
            <Route path="yukle" element={<UploadTab />} />
            <Route path="imtahanlar" element={<QuizBuilderTab />} />
            <Route path="sinaqlarim" element={<ExamBuilderTab />} />
            <Route path="sertifikatlarim" element={<MyCertificatesTab />} />
            <Route path="qazanc" element={<EarningsTab />} />
          </Route>
        </Route>

        {/* Admin paneli */}
        <Route element={<ProtectedRoute role="Admin" />}>
          <Route path="admin" element={<AdminPanelPage />}>
            <Route index element={<Navigate to="icmal" replace />} />
            <Route path="icmal" element={<DashboardTab />} />
            <Route path="moderasiya" element={<ModerationTab />} />
            <Route path="sinaqlar" element={<AdminExamsTab />} />
            <Route path="telimler" element={<AdminTrainingsTab />} />
            <Route path="istifadeciler" element={<UsersTab />} />
            <Route path="satis" element={<SalesTab />} />
            <Route path="sertifikatlar" element={<AdminCertificatesTab />} />
            <Route path="loglar" element={<LogsTab />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
