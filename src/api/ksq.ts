import { api } from './client';
import type {
  KsqResult,
  KsqResultList,
  KsqScanResult,
  KsqTest,
  SaveKsqResultRequest,
  SaveKsqTestRequest,
} from '../types';

export const ksqApi = {
  async tests() {
    const { data } = await api.get<KsqTest[]>('/ksq/tests');
    return data;
  },

  async createTest(payload: SaveKsqTestRequest) {
    const { data } = await api.post<KsqTest>('/ksq/tests', payload);
    return data;
  },

  async updateTest(id: string, payload: SaveKsqTestRequest) {
    const { data } = await api.put<KsqTest>(`/ksq/tests/${id}`, payload);
    return data;
  },

  /** Testin bütün nəticələri də silinir. */
  async deleteTest(id: string) {
    await api.delete(`/ksq/tests/${id}`);
  },

  async results(params: { testId?: string; sinif?: string } = {}) {
    const { data } = await api.get<KsqResultList>('/ksq/results', { params });
    return data;
  },

  /** Bal serverdə açara görə yenidən hesablanır. */
  async saveResult(payload: SaveKsqResultRequest) {
    const { data } = await api.post<KsqResult>('/ksq/results', payload);
    return data;
  },

  /** Hamısı ya saxlanır, ya heç biri. */
  async saveResults(items: SaveKsqResultRequest[]) {
    const { data } = await api.post<KsqResult[]>('/ksq/results/bulk', { items });
    return data;
  },

  async deleteResult(id: string) {
    await api.delete(`/ksq/results/${id}`);
  },

  /** Şəkil yalnız oxunur, serverdə saxlanmır. */
  async scan(image: Blob, closedCount: number, openCount: number) {
    const form = new FormData();
    form.append('image', image, 'kart.jpg');
    form.append('closedCount', String(closedCount));
    form.append('openCount', String(openCount));
    const { data } = await api.post<KsqScanResult>('/ksq/scan', form, { timeout: 90_000 });
    return data;
  },
};
