export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  category: Category;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface NewProduct {
  name: string;
  description?: string;
  categoryId: number;
  price: number;
}

export type UpdatedProduct = NewProduct;

export interface ProductAvailability {
  storeId: number;
  storeName: string;
  quantity: number;
}

export interface ProductWithAvailability extends Product {
  availability: ProductAvailability[];
}

export interface ProductsQueryParams {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  storeId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'categoryId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
