// Bütün tiplər backend-in real cavablarına (API_FRONTEND.md) uyğun yazılıb.
// Enum-lar JSON-da mətn kimi gəlir.

export type ResourceType =
  | 'WorkSheet'
  | 'Presentation'
  | 'Test'
  | 'MethodGuide'
  | 'Video'
  | 'ExternalLink';

/** Fayl yüklənən tiplər — `POST /resources` (multipart). */
export type FileResourceType = 'WorkSheet' | 'Presentation' | 'Test' | 'MethodGuide';
/** Link saxlanan tiplər — `POST /resources/link` (JSON). */
export type LinkResourceType = 'Video' | 'ExternalLink';
export type ResourceStatus = 'Pending' | 'Approved' | 'Rejected';
export type TrainingFormat = 'Live' | 'Online' | 'Video';
export type ItemType = 'Resource' | 'Training' | 'Exam';
export type UserRole = 'Student' | 'Teacher' | 'Admin';
export type AccountType = 'Student' | 'Teacher';
export type EnrollmentStatus = 'InProgress' | 'Completed';

/* ---------- Auth ---------- */

export interface User {
  id: string;
  fullName: string;
  email: string;
  subject: string | null;
  roles: UserRole[];
  /** Yalnız Teacher/Admin resurs yükləyə bilir — şagird `POST /resources`-dan 403 alır. */
  canPublishResources: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  subject?: string;
  /** Göndərilməsə backend `Student` yaradır. */
  accountType?: AccountType;
}

export interface BecomeAuthorRequest {
  subject?: string;
}

/* ---------- Resources ---------- */

export interface Resource {
  id: string;
  name: string;
  subject: string;
  grade: number;
  type: ResourceType;
  authorId: string;
  authorName: string;
  downloads: number;
  isPaid: boolean;
  price: number;
  status: ResourceStatus;
  hasQuiz: boolean;
  /** Video / ExternalLink olduqda true — fayl yox, link saxlanılır. */
  isLinkBased: boolean;
  isPurchased: boolean;
  /** Pulsuzdur VƏ YA alınıb VƏ YA sizinkidir — "Səbətə at" bunun tərsinə görə göstərilir. */
  canAccess: boolean;
  createdAt: string;
  approvedAt: string | null;
}

export interface ResourceDetail extends Resource {
  authorSubject: string | null;
  rejectionReason: string | null;
  quizId: string | null;
  originalFileName: string | null;
  /**
   * Pulsuz video/linkdə dolu gəlir — dərhal embed edilə bilər.
   * Ödənişli video satın alınmayıbsa `null` (link gizlədilir).
   */
  externalUrl: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ResourceQuery {
  subject?: string;
  grade?: number;
  type?: ResourceType;
  status?: ResourceStatus;
  isPaid?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface DownloadResult {
  resourceId: string;
  fileName: string;
  /** Fayl yolu VƏ YA xarici link — `isExternal`-a görə fərqli emal olunur. */
  downloadUrl: string;
  isExternal: boolean;
  downloads: number;
}

export interface UploadLinkRequest {
  name: string;
  subject: string;
  grade: number;
  type: LinkResourceType;
  externalUrl: string;
  isPaid?: boolean;
  price?: number;
}

export interface AuthorProfile {
  id: string;
  fullName: string;
  subject: string | null;
  resourceCount: number;
  totalDownloads: number;
  resources: Resource[];
}

/* ---------- Trainings ---------- */

export interface Training {
  id: string;
  name: string;
  format: TrainingFormat;
  description: string;
  price: number;
  durationHours: number;
  metaLabel: string;
  seatLimit: number | null;
  seatsTaken: number;
  seatsLeft: number | null;
  lessonCount: number;
  createdAt: string;
}

export interface SyllabusItem {
  id: string;
  orderIndex: number;
  text: string;
}

export interface TrainingDetail extends Training {
  syllabus: SyllabusItem[];
  /** Yalnız token göndərilibsə mənalıdır — anonim sorğuda həmişə false. */
  isEnrolled: boolean;
}

export interface CreateTrainingRequest {
  name: string;
  format: TrainingFormat;
  description: string;
  price: number;
  durationHours: number;
  metaLabel: string;
  seatLimit: number | null;
  syllabus: string[];
  lessons?: LessonInput[];
}

export interface UpdateTrainingRequest {
  name: string;
  format: TrainingFormat;
  description: string;
  price: number;
  durationHours: number;
  metaLabel: string;
  /** Mövcud qeydiyyat sayından aşağı ola bilməz (400). */
  seatLimit: number | null;
  /** Göndərilsə tam əvəz olunur, `null` buraxılsa toxunulmur. */
  syllabus: string[] | null;
}

export interface MyTraining {
  enrollmentId: string;
  trainingId: string;
  name: string;
  format: TrainingFormat;
  metaLabel: string;
  durationHours: number;
  progressPercent: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  certificateCode: string | null;
  completedLessonCount: number;
  totalLessonCount: number;
  completedAt: string | null;
}

/* ---------- Training lessons ---------- */

export interface TrainingLesson {
  id: string;
  orderIndex: number;
  title: string;
  description: string;
  /** Yalnız təlimə yazılmış istifadəçiyə qaytarılır. */
  videoUrl: string | null;
  durationMinutes: number | null;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface TrainingLessons {
  trainingId: string;
  trainingName: string;
  lessons: TrainingLesson[];
  completedLessonCount: number;
  totalLessonCount: number;
  progressPercent: number;
  status: EnrollmentStatus;
  certificateCode: string | null;
}

export interface LessonProgress {
  trainingId: string;
  lessonId: string;
  isCompleted: boolean;
  completedLessonCount: number;
  totalLessonCount: number;
  progressPercent: number;
  status: EnrollmentStatus;
  /** Yalnız 100%-ə çatanda dolur. */
  certificateCode: string | null;
}

export interface LessonInput {
  title: string;
  description: string;
  videoUrl?: string;
  durationMinutes?: number;
}

export interface SaveLessonsRequest {
  mode: 'append' | 'replace';
  lessons: LessonInput[];
}

/* ---------- Cart & orders ---------- */

export interface CartItem {
  id: string;
  itemType: ItemType;
  itemId: string;
  name: string;
  price: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  itemType: ItemType;
  itemId: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  code: string;
  customerName: string | null;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

/* ---------- Quiz ---------- */

export interface QuizMeta {
  id: string;
  resourceId: string;
  resourceName: string;
  passPercent: number;
  questionCount: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  options: string[];
  // correctOptionIndex FRONTEND-Ə HEÇ VAXT GÖNDƏRİLMİR
}

export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
}

export interface QuizSubmitResult {
  attemptId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passPercent: number;
  passed: boolean;
  certificateCode: string | null;
}

export interface SaveQuizRequest {
  passPercent: number;
  mode: 'append' | 'replace';
  questions: {
    questionText: string;
    options: string[];
    correctOptionIndex: number;
  }[];
}

/* ---------- Certificates ---------- */

export interface Certificate {
  id: string;
  code: string;
  holderName: string;
  description: string;
  trainingId: string | null;
  trainingName: string | null;
  issuedAt: string;
}

export interface CertificateVerifyResult {
  isValid: boolean;
  code: string;
  holderName: string | null;
  description: string | null;
  issuedAt: string | null;
}

/* ---------- Admin ---------- */

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  subject: string | null;
  roles: string[];
  resourceCount: number;
  approvedResourceCount: number;
  totalDownloads: number;
  enrollmentCount: number;
  certificateCount: number;
  createdAt: string;
}

export interface SalesSummary {
  gmv: number;
  commissionTotal: number;
  authorPayoutTotal: number;
  orderCount: number;
  itemCount: number;
  resourceRevenue: number;
  trainingRevenue: number;
  commissionPercent: number;
}

/* ---------- Sınaqlar (imtahan modulu) ---------- */

export type ExamAttemptStatus = 'InProgress' | 'Submitted' | 'Expired';

export interface Exam {
  id: string;
  name: string;
  subject: string;
  grade: number | null;
  authorId: string;
  authorName: string;
  durationMinutes: number;
  passPercent: number;
  isPaid: boolean;
  price: number;
  status: ResourceStatus;
  sectionCount: number;
  questionCount: number;
  attemptCount: number;
  isPurchased: boolean;
  /** false → "Səbətə at", true → "Sınağa başla". */
  canAccess: boolean;
  createdAt: string;
  approvedAt: string | null;
}

export interface ExamSectionSummary {
  id: string;
  orderIndex: number;
  subject: string;
  questionCount: number;
}

export interface ExamDetail extends Exam {
  description: string;
  rejectionReason: string | null;
  sections: ExamSectionSummary[];
  /** Doludursa istifadəçi sınağa başlayıb — statusa görə "Davam et"/"Nəticəyə bax". */
  myAttempt: ExamAttemptSummary | null;
}

export interface ExamQuestionInput {
  questionText: string;
  /** `POST /exams/{id}/images` cavabındakı dəyər. Sual ya mətn, ya şəkil ehtiva etməlidir. */
  imagePath?: string | null;
  options: string[];
  correctOptionIndex: number;
}

export interface ExamSectionInput {
  subject: string;
  questions: ExamQuestionInput[];
}

export interface CreateExamRequest {
  name: string;
  description: string;
  subject: string;
  grade: number | null;
  durationMinutes: number;
  passPercent: number;
  isPaid: boolean;
  price: number;
  sections: ExamSectionInput[];
}

/** Meta yeniləmə — suallara toxunmur. */
export type UpdateExamRequest = Omit<CreateExamRequest, 'sections'>;

export interface SaveExamSectionsRequest {
  sections: ExamSectionInput[];
}

export interface ExamImageUploadResult {
  imagePath: string;
  /** Göstərmək üçün: `${API_ORIGIN}${imageUrl}`. */
  imageUrl: string;
}

/* --- Sınağın verilməsi --- */

export interface ExamRunQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  imageUrl: string | null;
  options: string[];
  // correctOptionIndex BURADA YOXDUR
}

export interface ExamRunSection {
  id: string;
  orderIndex: number;
  subject: string;
  questions: ExamRunQuestion[];
}

export interface ExamRun {
  attemptId: string;
  examId: string;
  examName: string;
  durationMinutes: number;
  startedAt: string;
  expiresAt: string;
  /** SAYĞAC BUNDAN QURULUR — lokal saatdan yox. */
  remainingSeconds: number;
  sections: ExamRunSection[];
  questionCount: number;
}

export interface ExamAnswer {
  questionId: string;
  /** Cavabsız sual üçün `null` — səhv sayılır. */
  selectedIndex: number | null;
}

export interface ExamResultQuestion {
  questionId: string;
  orderIndex: number;
  questionText: string;
  imageUrl: string | null;
  options: string[];
  correctOptionIndex: number;
  selectedIndex: number | null;
  isCorrect: boolean;
}

export interface ExamResultSection {
  sectionId: string;
  subject: string;
  correctCount: number;
  questionCount: number;
  scorePercent: number;
  questions: ExamResultQuestion[];
}

export interface ExamResult {
  attemptId: string;
  examId: string;
  examName: string;
  status: Exclude<ExamAttemptStatus, 'InProgress'>;
  scorePercent: number;
  correctCount: number;
  questionCount: number;
  passPercent: number;
  passed: boolean;
  startedAt: string;
  submittedAt: string | null;
  elapsedSeconds: number;
  sections: ExamResultSection[];
  certificateCode: string | null;
}

export interface ExamAttemptSummary {
  id: string;
  examId: string;
  examName: string;
  status: ExamAttemptStatus;
  scorePercent: number;
  correctCount: number;
  questionCount: number;
  passed: boolean;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  certificateCode: string | null;
}

export interface ExamQuery {
  subject?: string;
  grade?: number;
  isPaid?: boolean;
  search?: string;
  status?: ResourceStatus;
  page?: number;
  pageSize?: number;
}

/* ---------- Admin icmalı və audit log ---------- */

export interface TrafficStats {
  totalRequests: number;
  requestsLast24Hours: number;
  failedRequests: number;
  clientErrors: number;
  serverErrors: number;
  serverErrorsLast24Hours: number;
  averageDurationMs: number;
  errorRatePercent: number;
}

export interface ContentStats {
  totalUsers: number;
  totalResources: number;
  pendingResources: number;
  approvedResources: number;
  rejectedResources: number;
  totalDownloads: number;
  blogPosts: number;
  issuedCertificates: number;
}

export interface TrainingStats {
  totalTrainings: number;
  liveTrainings: number;
  onlineTrainings: number;
  videoTrainings: number;
  totalLessons: number;
  totalEnrollments: number;
  completedEnrollments: number;
  soldTrainings: number;
  trainingRevenue: number;
}

export interface DashboardSalesStats {
  gmv: number;
  commissionTotal: number;
  authorPayoutTotal: number;
  paidOrders: number;
  pendingOrders: number;
  soldResources: number;
  resourceRevenue: number;
}

export interface ExamStats {
  totalExams: number;
  pendingExams: number;
  approvedExams: number;
  rejectedExams: number;
  totalQuestions: number;
  totalAttempts: number;
  attemptsInProgress: number;
  passedAttempts: number;
  averageScorePercent: number;
  soldExams: number;
  examRevenue: number;
}

export interface TopError {
  method: string;
  path: string;
  statusCode: number;
  count: number;
  lastOccurredAt: string;
}

export interface TopTraining {
  trainingId: string;
  name: string;
  enrollmentCount: number;
  revenue: number;
}

export interface AdminDashboard {
  traffic: TrafficStats;
  content: ContentStats;
  trainings: TrainingStats;
  sales: DashboardSalesStats;
  exams: ExamStats;
  topErrors: TopError[];
  topTrainings: TopTraining[];
  generatedAt: string;
}

export interface RequestLog {
  id: number;
  traceId: string;
  method: string;
  path: string;
  queryString: string | null;
  statusCode: number;
  durationMs: number;
  userId: string | null;
  userEmail: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestContentType: string | null;
  /** Şifrə/token sahələri "***" ilə maskalanıb. */
  requestBody: string | null;
  responseBody: string | null;
  exceptionType: string | null;
  createdAt: string;
}

export interface RequestLogQuery {
  method?: string;
  path?: string;
  statusCode?: number;
  userId?: string;
  onlyErrors?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/* ---------- Blog ---------- */

export interface BlogPost {
  id: string;
  title: string;
  tag: string;
  readTime: string;
  excerpt: string;
  createdAt: string;
}

export interface BlogPostDetail extends BlogPost {
  body: string[];
}

/* ---------- Backend hazır olana qədər frontend-də hesablanan tiplər ---------- */

export interface AuthorEarnings {
  grossTotal: number;
  commissionTotal: number;
  netTotal: number;
  commissionPercent: number;
  perResource: {
    resourceId: string;
    name: string;
    unitsSold: number;
    price: number;
    net: number;
  }[];
}

export interface PlatformStats {
  resourceCount: number;
  trainingCount: number;
  teacherCount: number;
  totalDownloads: number;
}
