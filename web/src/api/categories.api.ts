import apiClient from './client';
import type { CategoriesResponse, Category } from '../types/category.types';

export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<CategoriesResponse> => {
    return apiClient.get('/admin/categories');
  },

  // Alias for getCategories
  getAllCategories: async (): Promise<CategoriesResponse> => {
    return apiClient.get('/admin/categories');
  },

  // Create category
  createCategory: async (data: { name: string; slug: string }): Promise<{ success: boolean; message: string; category: Category }> => {
    return apiClient.post('/admin/categories', data);
  },

  // Update category
  updateCategory: async (id: number, data: { name?: string; slug?: string }): Promise<{ success: boolean; message: string; category: Category }> => {
    return apiClient.put(`/admin/categories/${id}`, data);
  },

  // Delete category
  deleteCategory: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/admin/categories/${id}`);
  },
};
