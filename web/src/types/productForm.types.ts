import { z } from 'zod';

// Basic Product Form Data
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category_id: number | '';
  status: 'draft' | 'published';
  price: number;
  compare_at_price?: number;
  sku: string;
  discount?: number;
}

// Variant Form Data
export interface VariantFormData {
  id?: number;
  product_id?: number;
  size?: string;
  color?: string;
  stock: number;
  additional_price?: number;
}

// Media Form Data
export interface MediaFormData {
  id?: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  display_order: number;
}

// Product with all related data
export interface ProductWithDetails {
  id: number;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  status: 'draft' | 'published';
  price: number;
  compare_at_price?: number;
  sku: string;
  discount?: number;
  variants: VariantFormData[];
  media: MediaFormData[];
}

// Validation Schemas
export const productBasicInfoSchema = z.object({
  name: z.string()
    .min(3, { message: 'Product name must be at least 3 characters long' })
    .max(255, { message: 'Product name must be less than 255 characters' }),
  slug: z.string()
    .min(1, { message: 'Slug is required' })
    .max(255, { message: 'Slug must be less than 255 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' }),
  description: z.string()
    .min(10, { message: 'Description must be at least 10 characters long' }),
  category_id: z.number({ message: 'Please select a category' }).positive({ message: 'Please select a valid category' }),
  status: z.enum(['draft', 'published'], {
    message: 'Status is required',
  }),
  price: z.number({ message: 'Price must be a number' }).min(0, { message: 'Price must be greater than or equal to 0' }),
  compare_at_price: z.number().positive({ message: 'Compare at price must be greater than 0' }).optional(),
  sku: z.string()
    .min(1, { message: 'SKU is required' })
    .max(100, { message: 'SKU must be less than 100 characters' }),
  discount: z.number()
    .min(0, { message: 'Discount cannot be negative' })
    .max(70, { message: 'Discount cannot exceed 70%' })
    .optional(),
});

export const variantSchema = z.object({
  size: z.string().max(50, { message: 'Size must be less than 50 characters' }).optional(),
  color: z.string().max(50, { message: 'Color must be less than 50 characters' }).optional(),
  stock: z.number({
    required_error: 'Stock is required',
    invalid_type_error: 'Stock must be a number',
  }).int({ message: 'Stock must be a whole number' }).min(0, { message: 'Stock cannot be negative' }),
  additional_price: z.number({ message: 'Additional price must be a number' }).min(0, { message: 'Additional price cannot be negative' }).optional(),
});

export const mediaSchema = z.object({
  url: z.string().url({ message: 'Invalid URL' }),
  alt_text: z.string().max(255, { message: 'Alt text must be less than 255 characters' }).optional(),
  is_primary: z.boolean(),
  display_order: z.number().int().min(0),
});

export type ProductBasicInfoFormData = z.infer<typeof productBasicInfoSchema>;
export type VariantSchemaData = z.infer<typeof variantSchema>;
export type MediaSchemaData = z.infer<typeof mediaSchema>;
