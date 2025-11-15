import apiService from './api';
import { Skill, User } from '../types';

export const skillService = {
  async getAllSkills(): Promise<Skill[]> {
    return apiService.get<Skill[]>('/skills');
  },

  async searchSkills(keyword: string): Promise<Skill[]> {
    return apiService.get<Skill[]>('/skills/search', { keyword });
  },

  async getSkillsByCategory(category: Skill['category']): Promise<Skill[]> {
    return apiService.get<Skill[]>(`/skills/category/${category}`);
  },

  async addSkillToUser(skillId: number): Promise<User> {
    // Use query parameter in URL since backend expects @RequestParam
    const response = await apiService.post<User>(`/users/skills?skillId=${skillId}`);
    return response;
  },

  async removeSkillFromUser(skillId: number): Promise<User> {
    const response = await apiService.delete<User>(`/users/skills/${skillId}`);
    return response;
  },

  async updateUserSkills(skillIds: number[]): Promise<User> {
    const response = await apiService.put<User>('/users/skills', { skillIds });
    return response;
  },
};

