import type { Product, Category } from '../../../generated/prisma';

export type ProductEntity = Product;

export type CategoryEntity = Category;

export interface CreateProductDTO {
  name: string;
  description?: string | undefined;
  categoryId: number;
  price: number;
}

export interface UpdateProductDTO {
  name?: string | undefined;
  description?: string | undefined;
  categoryId?: number | undefined;
  price?: number | undefined;
}

export interface ProductWithAvailability extends Product {
  availability: Array<{
    storeId: number;
    storeName: string;
    quantity: number;
  }>;
}

export interface ProductFilters {
  categoryId?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  minStock?: number | undefined;
  maxStock?: number | undefined;
  storeId?: number | undefined;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
