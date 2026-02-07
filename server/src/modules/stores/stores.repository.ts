import { PrismaClient } from '../../../generated/prisma';
import type { CreateStoreDTO, UpdateStoreDTO, StoreFilters } from '@/modules/stores/stores.types';
import { config } from '@/config';

export class StoreRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: StoreFilters) {
    const where = filters?.name
      ? { name: { contains: filters.name, mode: 'insensitive' as const } }
      : {};

    return this.prisma.store.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: number) {
    return this.prisma.store.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.store.findUnique({
      where: { name },
    });
  }

  async create(data: CreateStoreDTO) {
    return this.prisma.store.create({
      data: {
        name: data.name,
        location: data.location ?? null,
        description: data.description ?? null,
      },
    });
  }

  async update(id: number, data: UpdateStoreDTO) {
    return this.prisma.store.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.location !== undefined && { location: data.location ?? null }),
        ...(data.description !== undefined && { description: data.description ?? null }),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.store.delete({
      where: { id },
    });
  }

  async getStoreSummary(storeId: number) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: {
        store_products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!store) {
      return null;
    }

    const totalProducts = store.store_products.length;
    const totalInventoryValue = store.store_products.reduce((sum, sp) => {
      return sum + sp.product.price * sp.quantity;
    }, 0);
    const lowStockCount = store.store_products.filter((sp) => sp.quantity < config.inventory.lowStockThreshold).length;

    return {
      ...store,
      summary: {
        totalProducts,
        totalInventoryValue,
        lowStockCount,
      },
    };
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.store.count({
      where: { id },
    });
    return count > 0;
  }
}
