import { api } from './client';
import type {
  AuthorProfile,
  DownloadResult,
  PagedResult,
  QuizMeta,
  Resource,
  ResourceDetail,
  ResourceQuery,
  SaveQuizRequest,
  UploadLinkRequest,
} from '../types';
import type { FileResourceType } from '../types';

export interface UploadResourceInput {
  name: string;
  subject: string;
  grade: number;
  /** Yalnız fayl tipləri — Video/ExternalLink `uploadLink()`-dən keçir. */
  type: FileResourceType;
  isPaid: boolean;
  price: number;
  file: File;
}

export const resourcesApi = {
  async list(query: ResourceQuery = {}) {
    const { data } = await api.get<PagedResult<Resource>>('/resources', {
      params: query,
    });
    return data;
  },

  async get(id: string) {
    const { data } = await api.get<ResourceDetail>(`/resources/${id}`);
    return data;
  },

  async mine() {
    const { data } = await api.get<Resource[]>('/resources/mine');
    return data;
  },

  /** Ödənişi tamamlanmış sifarişlərdəki resurslar — "Aldıqlarım" siyahısı. */
  async purchased() {
    const { data } = await api.get<Resource[]>('/resources/purchased');
    return data;
  },

  async byAuthor(userId: string) {
    const { data } = await api.get<AuthorProfile>(`/resources/author/${userId}`);
    return data;
  },

  async download(id: string) {
    const { data } = await api.post<DownloadResult>(`/resources/${id}/download`);
    return data;
  },

  async upload(input: UploadResourceInput) {
    const form = new FormData();
    form.append('Name', input.name);
    form.append('Subject', input.subject);
    form.append('Grade', String(input.grade));
    form.append('Type', input.type);
    form.append('IsPaid', String(input.isPaid));
    form.append('Price', String(input.isPaid ? input.price : 0));
    form.append('file', input.file);

    const { data } = await api.post<ResourceDetail>('/resources', form);
    return data;
  },

  /**
   * Video / xarici link resursu — JSON-dur, multipart deyil.
   * `ExternalLink` yalnız pulsuz ola bilər (backend 400 qaytarır).
   */
  async uploadLink(input: UploadLinkRequest) {
    const { data } = await api.post<ResourceDetail>('/resources/link', input);
    return data;
  },

  async quizMeta(resourceId: string) {
    const { data } = await api.get<QuizMeta>(`/resources/${resourceId}/quiz`);
    return data;
  },

  async saveQuiz(resourceId: string, payload: SaveQuizRequest) {
    const { data } = await api.post<QuizMeta>(`/resources/${resourceId}/quiz`, payload);
    return data;
  },
};
