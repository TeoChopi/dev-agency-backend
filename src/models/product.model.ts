import { z } from 'zod';

/**
 * Product validation schema
 */
export const ProductSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  price: z.number().positive().multipleOf(0.01),
  category: z.string().min(1).max(100),
  imageUrl: z.string().url().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Product creation schema (without generated fields)
 */
export const CreateProductSchema = ProductSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Product update schema (all fields optional)
 */
export const UpdateProductSchema = CreateProductSchema.partial();

/**
 * Pagination query parameters schema
 */
export const PaginationQuerySchema = z.object({
  page: z.string().optional().transform((val) => {
    if (!val) return 1;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }),
  limit: z.string().optional().transform((val) => {
    if (!val) return 20;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return 20;
    return Math.min(parsed, 100); // Cap at 100
  }),
});

/**
 * Products query parameters schema
 */
export const ProductsQuerySchema = PaginationQuerySchema.extend({
  category: z.string().optional(),
  minPrice: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? undefined : parsed;
  }),
  maxPrice: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? undefined : parsed;
  }),
  search: z.string().optional(),
});

/**
 * TypeScript types inferred from Zod schemas
 */
export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type ProductsQuery = z.infer<typeof ProductsQuerySchema>;

/**
 * API response types
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}