import apiService from './api';
import { Job, JobRequest, JobSearchFilters, PaginatedResponse, PaginationParams } from '../types';

export const jobService = {
  async getJobs(params?: PaginationParams & JobSearchFilters): Promise<PaginatedResponse<Job>> {
    return apiService.get<PaginatedResponse<Job>>('/jobs', params);
  },

  async searchJobs(filters: JobSearchFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Job>> {
    return apiService.get<PaginatedResponse<Job>>('/jobs/search', { ...filters, ...pagination });
  },

  async getJobById(id: number): Promise<Job> {
    return apiService.get<Job>(`/jobs/${id}`);
  },

  async createJob(jobData: JobRequest): Promise<Job> {
    return apiService.post<Job>('/jobs', jobData);
  },

  async updateJob(id: number, jobData: JobRequest): Promise<Job> {
    return apiService.put<Job>(`/jobs/${id}`, jobData);
  },

  async deleteJob(id: number): Promise<void> {
    return apiService.delete<void>(`/jobs/${id}`);
  },

  async getMyJobs(): Promise<Job[]> {
    return apiService.get<Job[]>('/jobs/my-jobs');
  },

  async getRecentJobs(limit: number = 10): Promise<Job[]> {
    return apiService.get<Job[]>(`/jobs/recent?limit=${limit}`);
  },

  async getFeaturedJobs(limit?: number): Promise<Job[]> {
    const params = limit ? { limit } : undefined;
    return apiService.get<Job[]>('/jobs/featured', params);
  },

  async getJobsByCompany(companyId: number): Promise<Job[]> {
    return apiService.get<Job[]>(`/jobs/company/${companyId}`);
  },

  async getJobsByCategory(categoryId: number): Promise<Job[]> {
    return apiService.get<Job[]>(`/jobs/category/${categoryId}`);
  },
};
