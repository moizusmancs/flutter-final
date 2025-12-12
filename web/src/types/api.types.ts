export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Admin {
  id: number;
  username?: string;
  fullname?: string;
  email: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  admin: Admin;
}

export interface CheckAuthResponse {
  success: boolean;
  message?: string;
  admin: Admin;
}
