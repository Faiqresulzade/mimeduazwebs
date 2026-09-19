import { api } from './client';
import type {
  CreateExamRequest,
  Exam,
  ExamAnswer,
  ExamAttemptSummary,
  ExamDetail,
  ExamImageUploadResult,
  ExamQuery,
  ExamResult,
  ExamRun,
  PagedResult,
  SaveExamSectionsRequest,
  UpdateExamRequest,
} from '../types';

export const examsApi = {
  async list(query: ExamQuery = {}) {
    const { data } = await api.get<PagedResult<Exam>>('/exams', { params: query });
    return data;
  },

  /** Sualların özü burada YOXDUR — onlar yalnız `start()` ilə açılır. */
  async get(id: string) {
    const { data } = await api.get<ExamDetail>(`/exams/${id}`);
    return data;
  },

  async create(payload: CreateExamRequest) {
    const { data } = await api.post<ExamDetail>('/exams', payload);
    return data;
  },

  /** Yalnız meta məlumatlar — suallara toxunmur. */
  async update(id: string, payload: UpdateExamRequest) {
    const { data } = await api.put<ExamDetail>(`/exams/${id}`, payload);
    return data;
  },

  /** Bütün bölmə/sualları əvəz edir. Cəhd varsa 409. */
  async saveSections(id: string, payload: SaveExamSectionsRequest) {
    const { data } = await api.put<ExamDetail>(`/exams/${id}/sections`, payload);
    return data;
  },

  async remove(id: string) {
    await api.delete(`/exams/${id}`);
  },

  /** Düstur/qrafik sualları üçün şəkil — max 5 MB, jpg/png/webp. */
  async uploadImage(id: string, file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ExamImageUploadResult>(`/exams/${id}/images`, form);
    return data;
  },

  async mine() {
    const { data } = await api.get<Exam[]>('/exams/mine');
    return data;
  },

  async purchased() {
    const { data } = await api.get<Exam[]>('/exams/purchased');
    return data;
  },

  /**
   * Cəhdi başladır və sualları qaytarır. Təkrar çağırmaq təhlükəsizdir —
   * eyni cəhd qayıdır, vaxt sıfırlanmır.
   */
  async start(id: string) {
    const { data } = await api.post<ExamRun>(`/exams/${id}/start`);
    return data;
  },

  async submit(attemptId: string, answers: ExamAnswer[]) {
    const { data } = await api.post<ExamResult>(`/exams/attempts/${attemptId}/submit`, {
      answers,
    });
    return data;
  },

  async result(attemptId: string) {
    const { data } = await api.get<ExamResult>(`/exams/attempts/${attemptId}`);
    return data;
  },

  async attemptsMine() {
    const { data } = await api.get<ExamAttemptSummary[]>('/exams/attempts/mine');
    return data;
  },
};
