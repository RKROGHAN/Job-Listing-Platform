import apiService from './api';
import { Company, PaginatedResponse, PaginationParams } from '../types';

export const companyService = {
  async getCompanies(params?: PaginationParams): Promise<PaginatedResponse<Company>> {
    return apiService.get<PaginatedResponse<Company>>('/companies', params);
  },

  async searchCompanies(keyword: string): Promise<Company[]> {
    return apiService.get<Company[]>('/companies/search', { keyword });
  },

  async getCompaniesByIndustry(industry: string): Promise<Company[]> {
    return apiService.get<Company[]>(`/companies/industry/${industry}`);
  },

  async getVerifiedCompanies(): Promise<Company[]> {
    return apiService.get<Company[]>('/companies/verified');
  },

  async getCompanyById(id: number): Promise<Company> {
    return apiService.get<Company>(`/companies/${id}`);
  },

  async getMyCompany(): Promise<Company> {
    return apiService.get<Company>('/companies/my-company');
  },

  async createCompany(companyData: Company): Promise<Company> {
    return apiService.post<Company>('/companies', companyData);
  },

  async updateCompany(id: number, companyData: Company): Promise<Company> {
    return apiService.put<Company>(`/companies/${id}`, companyData);
  },

  async deleteCompany(id: number): Promise<void> {
    return apiService.delete<void>(`/companies/${id}`);
  },

  async updateCompanyLogo(id: number, logoUrl: string): Promise<Company> {
    const url = `/companies/${id}/logo?logoUrl=${encodeURIComponent(logoUrl)}`;
    return apiService.put<Company>(url);
  },

  async updateCompanyCoverImage(id: number, coverImageUrl: string): Promise<Company> {
    const url = `/companies/${id}/cover-image?coverImageUrl=${encodeURIComponent(coverImageUrl)}`;
    return apiService.put<Company>(url);
  },

  async verifyCompany(id: number): Promise<void> {
    return apiService.post<void>(`/companies/${id}/verify`);
  },
};
