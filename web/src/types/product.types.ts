export interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  category_id: number;
  category_name: string;
  price: number;
  compare_at_price?: number;
  discount?: number;
  status: 'active' | 'inactive' | 'out_of_stock' | 'draft' | 'published' | 'archived';
  sku: string;
  created_at: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size?: string;
  color?: string;
  stock: number;
  additional_price?: number;
}

export interface ProductMedia {
  id: number;
  product_id: number;
  url: string;
  is_primary: boolean;
}

export interface ProductDetails extends Product {
  variants: ProductVariant[];
  media: ProductMedia[];
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductDetailsResponse {
  success: boolean;
  message: string;
  product: Product;
  variants: ProductVariant[];
  media: ProductMedia[];
}

export interface ProductFormData {
  name: string;
  description?: string;
  slug: string;
  category_id: number;
  price: number;
  compare_at_price?: number;
  status: 'active' | 'inactive';
  sku: string;
}

export interface VariantFormData {
  id?: number;
  product_id?: number;
  size?: string;
  color?: string;
  stock: number;
  additional_price?: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  status?: 'active' | 'inactive' | 'out_of_stock';
}
