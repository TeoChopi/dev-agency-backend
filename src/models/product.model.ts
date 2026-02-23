import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  image_url: z.string().url('Invalid URL format').optional(),
  description: z.string().optional(),
  in_stock: z.boolean().default(true),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  category: z.string().optional(),
  in_stock: z.string().transform((val) => val === 'true').optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'price', 'created_at']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  description: string | null;
  in_stock: boolean;
  created_at: Date;
  updated_at: Date;
}