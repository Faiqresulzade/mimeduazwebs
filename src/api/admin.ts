import { api } from './client';
import type {
  AdminDashboard,
  AdminUser,
  ExamDetail,
  Order,
  PagedResult,
  RequestLog,
  RequestLogQuery,
  ResourceDetail,
  SalesSummary,
} from '../types';

export const adminApi = {
  /** Panelin baş səhifəsi — bütün icmal göstəriciləri tək sorğuda. */
  async dashboard() {
    const { data } = await api.get<AdminDashboard>('/admin/dashboard');
    return data;
  },

  /**
   * Moderasiya növbəsi. `ResourceDetailDto` qaytarır — moderator təsdiqdən
   * əvvəl linki və fayl adını görməlidir.
   */
  async pendingResources() {
    const { data } = await api.get<ResourceDetail[]>('/admin/resources/pending');
    return data;
  },

  async approveResource(id: string) {
    const { data } = await api.post<ResourceDetail>(`/admin/resources/${id}/approve`);
    return data;
  },

  async rejectResource(id: string, reason?: string) {
    const { data } = await api.post<ResourceDetail>(`/admin/resources/${id}/reject`, {
      reason,
    });
    return data;
  },

  async pendingExams() {
    const { data } = await api.get<ExamDetail[]>('/admin/exams/pending');
    return data;
  },

  async approveExam(id: string) {
    const { data } = await api.post<ExamDetail>(`/admin/exams/${id}/approve`);
    return data;
  },

  async rejectExam(id: string, reason?: string) {
    const { data } = await api.post<ExamDetail>(`/admin/exams/${id}/reject`, { reason });
    return data;
  },

  async users() {
    const { data } = await api.get<AdminUser[]>('/admin/users');
    return data;
  },

  async sales() {
    const { data } = await api.get<SalesSummary>('/admin/sales');
    return data;
  },

  async orders() {
    const { data } = await api.get<Order[]>('/admin/orders');
    return data;
  },

  /** HTTP audit log — bütün sorğuların tarixçəsi. */
  async logs(query: RequestLogQuery = {}) {
    const { data } = await api.get<PagedResult<RequestLog>>('/admin/logs', {
      params: query,
    });
    return data;
  },
};
