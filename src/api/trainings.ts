import { api } from './client';
import type {
  CreateTrainingRequest,
  LessonProgress,
  MyTraining,
  SaveLessonsRequest,
  Training,
  TrainingDetail,
  TrainingLessons,
  UpdateTrainingRequest,
} from '../types';

export const trainingsApi = {
  async list() {
    const { data } = await api.get<Training[]>('/trainings');
    return data;
  },

  async get(id: string) {
    const { data } = await api.get<TrainingDetail>(`/trainings/${id}`);
    return data;
  },

  async mine() {
    const { data } = await api.get<MyTraining[]>('/trainings/mine');
    return data;
  },

  async create(payload: CreateTrainingRequest) {
    const { data } = await api.post<TrainingDetail>('/trainings', payload);
    return data;
  },

  async update(id: string, payload: UpdateTrainingRequest) {
    const { data } = await api.put<TrainingDetail>(`/trainings/${id}`, payload);
    return data;
  },

  /** Qeydiyyatı olan təlim silinmir — backend 409 qaytarır. */
  async remove(id: string) {
    await api.delete(`/trainings/${id}`);
  },

  /** Yalnız təlimə yazılanlar üçün — başqasına 403. */
  async lessons(trainingId: string) {
    const { data } = await api.get<TrainingLessons>(`/trainings/${trainingId}/lessons`);
    return data;
  },

  /** İdempotentdir — eyni dərsi təkrar göndərmək faizi artırmır. */
  async completeLesson(trainingId: string, lessonId: string) {
    const { data } = await api.post<LessonProgress>(
      `/trainings/${trainingId}/lessons/${lessonId}/complete`,
    );
    return data;
  },

  async uncompleteLesson(trainingId: string, lessonId: string) {
    const { data } = await api.delete<LessonProgress>(
      `/trainings/${trainingId}/lessons/${lessonId}/complete`,
    );
    return data;
  },

  async saveLessons(trainingId: string, payload: SaveLessonsRequest) {
    const { data } = await api.post<TrainingLessons>(
      `/trainings/${trainingId}/lessons`,
      payload,
    );
    return data;
  },
};
