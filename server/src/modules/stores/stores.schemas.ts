import { z } from 'zod';

export const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name too long'),
  location: z.string().max(200, 'Location too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

export const updateStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(100, 'Store name too long').optional(),
  location: z.string().max(200, 'Location too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export const storeIdSchema = z.object({
  id: z.coerce.number().int().positive('Invalid store ID'),
});

export const storeFiltersSchema = z.object({
  name: z.string().optional(),
});

export const storeIdParamSchema = z.object({
  storeId: z.coerce.number().int().positive('Invalid store ID'),
});

export const addProductToStoreSchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
  quantity: z.number().int().nonnegative('Quantity must be non-negative'),
});

export const updateStoreProductSchema = z.object({
  quantity: z.number().int().nonnegative('Quantity must be non-negative'),
});

export const storeProductParamsSchema = z.object({
  storeId: z.coerce.number().int().positive('Invalid store ID'),
  productId: z.coerce.number().int().positive('Invalid product ID'),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type StoreIdParam = z.infer<typeof storeIdSchema>;
export type StoreFiltersInput = z.infer<typeof storeFiltersSchema>;
export type StoreIdParamInput = z.infer<typeof storeIdParamSchema>;
export type AddProductToStoreInput = z.infer<typeof addProductToStoreSchema>;
export type UpdateStoreProductInput = z.infer<typeof updateStoreProductSchema>;
export type StoreProductParams = z.infer<typeof storeProductParamsSchema>;
