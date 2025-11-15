import apiService from './api';
import { SavedJob, PaginatedResponse, PaginationParams } from '../types';

export const savedJobService = {
  async saveJob(jobId: number): Promise<void> {
    return apiService.post<void>(`/saved-jobs/${jobId}`);
  },

  async unsaveJob(jobId: number): Promise<void> {
    return apiService.delete<void>(`/saved-jobs/${jobId}`);
  },

  async getSavedJobs(params?: PaginationParams): Promise<PaginatedResponse<SavedJob>> {
    return apiService.get<PaginatedResponse<SavedJob>>('/saved-jobs', params);
  },

  async getAllSavedJobs(): Promise<SavedJob[]> {
    return apiService.get<SavedJob[]>('/saved-jobs/all');
  },

  async isJobSaved(jobId: number): Promise<{ isSaved: boolean }> {
    return apiService.get<{ isSaved: boolean }>(`/saved-jobs/${jobId}/is-saved`);
  },

  async getSavedJobsCount(): Promise<{ savedJobsCount: number }> {
    return apiService.get<{ savedJobsCount: number }>('/saved-jobs/count');
  },
};
