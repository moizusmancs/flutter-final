export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count?: number;
}

export interface CategoriesResponse {
  success: boolean;
  message: string;
  categories: Category[];
}
