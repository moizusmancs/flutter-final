import apiClient from './client';
import type {
  ProductsResponse,
  ProductDetailsResponse,
  ProductFormData,
  VariantFormData,
  ProductFilters,
  ProductVariant,
} from '../types/product.types';

export const productsApi = {
  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    return apiClient.get(`/admin/products${queryString ? `?${queryString}` : ''}`);
  },

  // Get single product with variants and media
  getProduct: async (id: number): Promise<ProductDetailsResponse> => {
    return apiClient.get(`/admin/products/${id}`);
  },

  // Get single product by ID (alias for getProduct)
  getProductById: async (id: number): Promise<ProductDetailsResponse> => {
    return apiClient.get(`/admin/products/${id}`);
  },

  // Create new product (two-step process)
  createProduct: async (data: any): Promise<{ success: boolean; message: string; product: any }> => {
    // Step 1: Create empty product
    const createResponse: any = await apiClient.post('/admin/products/new', {});
    const productId = createResponse.productId;

    // Step 2: Update with actual data
    const payload = {
      productId: Number(productId),
      name: data.name,
      description: data.description,
      price: Number(data.price),
      categoryId: Number(data.category_id),
      discount: Number(data.discount || 0),
      status: data.status,
    };

    console.log('Creating product with payload:', payload);

    try {
      const updateResponse: any = await apiClient.put('/admin/products/update', payload);
      return updateResponse;
    } catch (error: any) {
      console.error('Product creation error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: number, data: any): Promise<{ success: boolean; message: string; product: any }> => {
    return apiClient.put('/admin/products/update', {
      productId: id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.category_id,
      discount: data.discount || 0,
      status: data.status,
    });
  },

  // Delete product
  deleteProduct: async (id: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/admin/products/${id}`);
  },

  // Update product status
  updateProductStatus: async (id: number, status: 'active' | 'inactive' | 'out_of_stock'): Promise<{ success: boolean; message: string; product: any }> => {
    return apiClient.put(`/admin/products/${id}/status`, { status });
  },

  // Get product variants
  getProductVariants: async (productId: number): Promise<{ success: boolean; message: string; variants: ProductVariant[]; count: number }> => {
    return apiClient.get(`/admin/products/${productId}/variants`);
  },

  // Add variant to product
  addVariant: async (productId: number, data: VariantFormData): Promise<{ success: boolean; message: string; variant: ProductVariant }> => {
    return apiClient.post(`/admin/products/${productId}/variants`, data);
  },

  // Update variant
  updateVariant: async (variantId: number, data: Partial<VariantFormData>): Promise<{ success: boolean; message: string; variant: ProductVariant }> => {
    return apiClient.put(`/admin/products/variants/${variantId}`, data);
  },

  // Delete variant
  deleteVariant: async (variantId: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/admin/products/variants/${variantId}`);
  },

  // Update variant stock
  updateVariantStock: async (variantId: number, stock: number): Promise<{ success: boolean; message: string; variant: any }> => {
    return apiClient.put(`/admin/products/variants/${variantId}/stock`, { stock });
  },

  // Media endpoints
  generatePresignedUrl: async (fileName: string): Promise<{ success: boolean; message: string; uploadUrl: string; fileUrl: string; key: string }> => {
    return apiClient.get(`/admin/products/media/upload?fileName=${encodeURIComponent(fileName)}`);
  },

  addProductMedia: async (productId: number, url: string, is_primary: boolean = false): Promise<{ success: boolean; message: string; media: any }> => {
    return apiClient.post(`/admin/products/${productId}/media`, { url, is_primary });
  },

  deleteMedia: async (mediaId: number): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/admin/products/media/${mediaId}`);
  },

  setPrimaryMedia: async (mediaId: number): Promise<{ success: boolean; message: string; media: any }> => {
    return apiClient.put(`/admin/products/media/${mediaId}/primary`);
  },
};
