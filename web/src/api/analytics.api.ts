import apiClient from './client';
import type {
  AnalyticsStatsResponse,
  RevenueResponse,
  TopProductsResponse,
  RecentOrdersResponse,
} from '../types/analytics.types';

export const analyticsApi = {
  // Get overall statistics for dashboard
  getStats: async (): Promise<AnalyticsStatsResponse> => {
    return apiClient.get('/admin/analytics/stats');
  },

  // Get revenue data over time
  getRevenue: async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    start_date?: string;
    end_date?: string;
  }): Promise<RevenueResponse> => {
    return apiClient.get('/admin/analytics/revenue', { params });
  },

  // Get top selling products
  getTopProducts: async (params?: {
    limit?: number;
    period?: '7days' | '30days' | '90days' | 'all';
  }): Promise<TopProductsResponse> => {
    return apiClient.get('/admin/analytics/top-products', { params });
  },

  // Get recent orders
  getRecentOrders: async (params?: {
    limit?: number;
    status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  }): Promise<RecentOrdersResponse> => {
    return apiClient.get('/admin/analytics/recent-orders', { params });
  },
};
