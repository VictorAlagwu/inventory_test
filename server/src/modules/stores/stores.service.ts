import { StoreRepository } from '@/modules/stores/stores.repository';
import type { CreateStoreDTO, UpdateStoreDTO, StoreFilters } from '@/modules/stores/stores.types';

export class StoreNotFoundError extends Error {
  statusCode = 404;
  code = 'STORE_NOT_FOUND';

  constructor(id: number) {
    super(`Store with ID ${id} not found`);
    this.name = 'StoreNotFoundError';
  }
}

export class DuplicateStoreNameError extends Error {
  statusCode = 409;
  code = 'DUPLICATE_STORE_NAME';

  constructor(name: string) {
    super(`Store with name '${name}' already exists`);
    this.name = 'DuplicateStoreNameError';
  }
}

export class StoreService {
  constructor(private repository: StoreRepository) {}

  async getAllStores(filters?: StoreFilters) {
    return this.repository.findAll(filters);
  }

  async getStoreById(id: number) {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new StoreNotFoundError(id);
    }
    return store;
  }

  async createStore(data: CreateStoreDTO) {
    try {
      return await this.repository.create(data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DuplicateStoreNameError(data.name);
      }
      throw error;
    }
  }

  async updateStore(id: number, data: UpdateStoreDTO) {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new StoreNotFoundError(id);
    }

    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new DuplicateStoreNameError(data.name!);
      }
      throw error;
    }
  }

  async deleteStore(id: number) {
    const store = await this.repository.findById(id);
    if (!store) {
      throw new StoreNotFoundError(id);
    }

    await this.repository.delete(id);
  }

  async getStoreSummary(id: number) {
    const storeSummary = await this.repository.getStoreSummary(id);
    if (!storeSummary) {
      throw new StoreNotFoundError(id);
    }
    return storeSummary;
  }
}
