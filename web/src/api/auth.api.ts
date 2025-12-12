import apiClient from './client';
import type { LoginResponse, CheckAuthResponse } from '../types/api.types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post('/admin/auth/login', { email, password });
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/admin/auth/logout');
  },

  checkAuth: async (): Promise<CheckAuthResponse> => {
    return apiClient.get('/admin/auth/check');
  },
};
