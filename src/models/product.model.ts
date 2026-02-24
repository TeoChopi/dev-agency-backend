import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  price: z.number()
    .positive('Price must be positive')
    .max(999999.99, 'Price cannot exceed 999,999.99'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
  image_url: z.string()
    .url('Must be a valid URL')
    .optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const ProductParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().positive('ID must be a positive integer')
  ),
});

export const ProductQuerySchema = z.object({
  page: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().positive().default(1)
  ).optional(),
  limit: z.string().transform((val) => parseInt(val, 10)).pipe(
    z.number().int().positive().max(100).default(10)
  ).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['name', 'price', 'category', 'createdAt']).default('createdAt').optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type ProductParams = z.infer<typeof ProductParamsSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedProducts {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}