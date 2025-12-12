export interface OrderStats {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface RevenueStats {
  total: number;
  average_order_value: number;
  last_30_days: number;
  previous_30_days: number;
  growth_percentage: number;
}

export interface OrdersTrend {
  last_30_days: number;
  previous_30_days: number;
  growth_percentage: number;
}

export interface UserStats {
  total: number;
  new_last_30_days: number;
}

export interface ProductStats {
  total: number;
  active: number;
  categories: number;
  variants: number;
}

export interface OverallStats {
  orders: OrderStats;
  revenue: RevenueStats;
  orders_trend: OrdersTrend;
  users: UserStats;
  products: ProductStats;
}

export interface RevenueDataPoint {
  period: string;
  total_orders: number;
  revenue: number;
  average_order_value: number;
  completed_orders: number;
  cancelled_orders: number;
}

export interface TopProduct {
  id: number;
  name: string;
  slug: string;
  order_count: number;
  total_quantity_sold: number;
  total_revenue: number;
  average_price: number;
  image_url: string;
}

export interface RecentOrder {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  created_at: string;
  user_name: string;
  user_email: string;
  item_count: number;
  first_product_image?: string;
}

export interface AnalyticsStatsResponse {
  success: boolean;
  message: string;
  stats: OverallStats;
}

export interface RevenueResponse {
  success: boolean;
  message: string;
  period: string;
  data: RevenueDataPoint[];
}

export interface TopProductsResponse {
  success: boolean;
  message: string;
  period: string;
  limit: number;
  products: TopProduct[];
}

export interface RecentOrdersResponse {
  success: boolean;
  message: string;
  status?: string;
  limit: number;
  orders: RecentOrder[];
}
