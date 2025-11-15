import apiService from './api';
import { JobApplication, ApplicationRequest, PaginatedResponse, PaginationParams } from '../types';

export const applicationService = {
  async applyForJob(applicationData: ApplicationRequest): Promise<JobApplication> {
    return apiService.post<JobApplication>('/applications', applicationData);
  },

  async getMyApplications(params?: PaginationParams): Promise<PaginatedResponse<JobApplication>> {
    return apiService.get<PaginatedResponse<JobApplication>>('/applications', params);
  },

  async getApplicationsForJob(jobId: number, params?: PaginationParams): Promise<PaginatedResponse<JobApplication>> {
    return apiService.get<PaginatedResponse<JobApplication>>(`/applications/job/${jobId}`, params);
  },

  async getApplicationById(id: number): Promise<JobApplication> {
    return apiService.get<JobApplication>(`/applications/${id}`);
  },

  async updateApplicationStatus(
    id: number, 
    status: JobApplication['status'], 
    notes?: string
  ): Promise<JobApplication> {
    return apiService.put<JobApplication>(`/applications/${id}/status`, { status, notes });
  },

  async scheduleInterview(
    id: number, 
    interviewTime: string, 
    notes?: string
  ): Promise<JobApplication> {
    return apiService.post<JobApplication>(`/applications/${id}/interview`, { interviewTime, notes });
  },

  async withdrawApplication(id: number): Promise<void> {
    return apiService.delete<void>(`/applications/${id}`);
  },

  async getApplicationsByStatus(
    status: JobApplication['status'], 
    params?: PaginationParams
  ): Promise<PaginatedResponse<JobApplication>> {
    return apiService.get<PaginatedResponse<JobApplication>>(`/applications/status/${status}`, params);
  },

  async getApplicationStats(): Promise<{ totalApplications: number }> {
    return apiService.get<{ totalApplications: number }>('/applications/stats');
  },
};
