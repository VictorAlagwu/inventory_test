import { ProductRepository } from '@/modules/products/products.repository';
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginationParams,
} from '@/modules/products/products.types';
import type {
  AddProductToStoreDTO,
  UpdateStoreProductDTO,
} from '@/modules/stores/stores.types';

export class ProductNotFoundError extends Error {
  statusCode = 404;
  code = 'PRODUCT_NOT_FOUND';

  constructor(id: number) {
    super(`Product with ID ${id} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class ProductAlreadyInStoreError extends Error {
  statusCode = 409;
  code = 'PRODUCT_ALREADY_IN_STORE';

  constructor(productId: number, storeId: number) {
    super(`Product ${productId} already exists in store ${storeId}`);
    this.name = 'ProductAlreadyInStoreError';
  }
}

export class StoreProductNotFoundError extends Error {
  statusCode = 404;
  code = 'STORE_PRODUCT_NOT_FOUND';

  constructor(storeId: number, productId: number) {
    super(`Product ${productId} not found in store ${storeId}`);
    this.name = 'StoreProductNotFoundError';
  }
}

export class ProductService {
  constructor(private repository: ProductRepository) {}

  async getAllProducts(filters?: ProductFilters, pagination?: PaginationParams) {
    return this.repository.findAll(filters, pagination);
  }

  async getProductById(id: number) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    return product;
  }

  async createProduct(data: CreateProductDTO) {
    return this.repository.create(data);
  }

  async updateProduct(id: number, data: UpdateProductDTO) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    return this.repository.update(id, data);
  }

  async deleteProduct(id: number) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    await this.repository.delete(id);
  }

  async getProductAvailability(id: number) {
    const availability = await this.repository.getProductAvailability(id);
    if (!availability) {
      throw new ProductNotFoundError(id);
    }
    return availability;
  }

  async addProductToStore(storeId: number, data: AddProductToStoreDTO) {
    const product = await this.repository.findById(data.productId);
    if (!product) {
      throw new ProductNotFoundError(data.productId);
    }

    try {
      return await this.repository.addToStore(storeId, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ProductAlreadyInStoreError(data.productId, storeId);
      }
      throw error;
    }
  }

  async getStoreProducts(storeId: number) {
    return this.repository.findByStore(storeId);
  }

  async updateProductInStore(
    storeId: number,
    productId: number,
    data: UpdateStoreProductDTO
  ) {
    try {
      return await this.repository.updateInStore(storeId, productId, data);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new StoreProductNotFoundError(storeId, productId);
      }
      throw error;
    }
  }

  async removeProductFromStore(storeId: number, productId: number) {
    try {
      await this.repository.removeFromStore(storeId, productId);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new StoreProductNotFoundError(storeId, productId);
      }
      throw error;
    }
  }
}
