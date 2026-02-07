import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  categoryId: z.number().int().positive('Invalid category ID'),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price too high'),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200, 'Product name too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  categoryId: z.number().int().positive('Invalid category ID').optional(),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price too high').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const productIdSchema = z.object({
  id: z.coerce.number().int().positive('Invalid product ID'),
});

export const productFiltersSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minStock: z.coerce.number().nonnegative().optional(),
  maxStock: z.coerce.number().nonnegative().optional(),
  storeId: z.coerce.number().int().positive().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['name', 'price', 'categoryId', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductIdParam = z.infer<typeof productIdSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
