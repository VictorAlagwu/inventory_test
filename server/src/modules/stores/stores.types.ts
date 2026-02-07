import type { Store } from '../../../generated/prisma';

export type StoreEntity = Store;

export interface CreateStoreDTO {
  name: string;
  location?: string | undefined;
  description?: string | undefined;
}

export interface UpdateStoreDTO {
  name?: string | undefined;
  location?: string | undefined;
  description?: string | undefined;
}

export interface StoreWithSummary extends Store {
  summary: {
    totalProducts: number;
    totalInventoryValue: number;
    lowStockCount: number;
  };
}

export interface StoreFilters {
  name?: string | undefined;
}

export interface AddProductToStoreDTO {
  productId: number;
  quantity: number;
}

export interface UpdateStoreProductDTO {
  quantity?: number | undefined;
}
