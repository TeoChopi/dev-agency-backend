import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category: z.string().min(1).max(100),
  image_url: z.string().url().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
  image_url: z.string().url('Invalid URL format').optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'category', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;