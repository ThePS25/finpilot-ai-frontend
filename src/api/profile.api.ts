import { apiClient } from './client';
import type { ApiResponse, Profile } from '@/types';

export const profileApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<{ profiles: Profile[] }>>('/profiles', { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<{ profile: Profile }>>(`/profiles/${id}`),

  create: (data: Partial<Profile>) =>
    apiClient.post<ApiResponse<{ profile: Profile }>>('/profiles', data),

  update: (id: string, data: Partial<Profile>) =>
    apiClient.put<ApiResponse<{ profile: Profile }>>(`/profiles/${id}`, data),

  delete: (id: string) => apiClient.delete(`/profiles/${id}`),

  setPrimary: (id: string) =>
    apiClient.patch<ApiResponse<{ profile: Profile }>>(`/profiles/${id}/primary`),
};
