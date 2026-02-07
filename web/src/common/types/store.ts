import type { Product } from './product';

export interface Store {
  id: number;
  name: string;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewStore {
  name: string;
  location?: string;
  description?: string;
}

export type UpdatedStore = NewStore;

export interface StoreSummary {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

export interface StoreWithSummary extends Store {
  summary: StoreSummary;
}

export interface ProductWithQuantity extends Product {
  quantity: number;
}

export interface StoreProductPayload {
  productId: number;
  quantity: number;
}
