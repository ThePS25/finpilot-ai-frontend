import { apiClient } from './client';
import type { ApiResponse, User, LoginResponse, TwoFactorSetup } from '@/types';

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data),

  login: (data: { email: string; password: string; totpCode?: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data),

  logout: () => apiClient.post('/auth/logout'),

  getMe: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post('/auth/reset-password', { token, password }),

  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/verify-email', { token }),

  sendVerification: () =>
    apiClient.post<ApiResponse<unknown>>('/auth/send-verification'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),

  updateProfile: (data: { name: string }) =>
    apiClient.patch<ApiResponse<{ user: User }>>('/auth/me', data),

  setup2FA: () =>
    apiClient.post<ApiResponse<{ setup: TwoFactorSetup }>>('/auth/2fa/setup'),

  enable2FA: (totpCode: string) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/2fa/enable', { totpCode }),

  disable2FA: (totpCode: string) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/2fa/disable', { totpCode }),
};
