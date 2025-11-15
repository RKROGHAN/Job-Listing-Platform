import apiService from './api';
import { Category } from '../types';

export const categoryService = {
  async getAllCategories(): Promise<Category[]> {
    return apiService.get<Category[]>('/categories');
  },

  async getCategoryById(id: number): Promise<Category> {
    return apiService.get<Category>(`/categories/${id}`);
  },

  async createCategory(categoryData: Category): Promise<Category> {
    return apiService.post<Category>('/categories', categoryData);
  },

  async updateCategory(id: number, categoryData: Category): Promise<Category> {
    return apiService.put<Category>(`/categories/${id}`, categoryData);
  },

  async deleteCategory(id: number): Promise<void> {
    return apiService.delete<void>(`/categories/${id}`);
  },
};

