import { PrismaClient } from '../../../generated/prisma';
import type {
  CreateProductDTO,
  UpdateProductDTO,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/modules/products/products.types';
import type {
  AddProductToStoreDTO,
  UpdateStoreProductDTO,
} from '@/modules/stores/stores.types';

const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  price: 'price',
  categoryId: 'category_id',
  createdAt: 'created_at',
};

export class ProductRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<any>> {
    const where: any = {};

    if (filters?.categoryId) {
      where.category_id = filters.categoryId;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.minStock !== undefined || filters?.maxStock !== undefined || filters?.storeId) {
      where.store_products = {
        some: {
          ...(filters.storeId && { store_id: filters.storeId }),
          ...(filters.minStock !== undefined || filters.maxStock !== undefined
            ? {
                quantity: {
                  ...(filters.minStock !== undefined && { gte: filters.minStock }),
                  ...(filters.maxStock !== undefined && { lte: filters.maxStock }),
                },
              }
            : {}),
        },
      };
    }

    const total = await this.prisma.product.count({ where });

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    const orderBy: any = {};
    const sortField = SORT_FIELD_MAP[pagination?.sortBy || 'name'] || 'name';
    orderBy[sortField] = pagination?.sortOrder || 'asc';

    const products = await this.prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: true },
    });

    return {
      items: products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async create(data: CreateProductDTO) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        category_id: data.categoryId,
        price: data.price,
      },
      include: { category: true },
    });
  }

  async update(id: number, data: UpdateProductDTO) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description ?? null }),
        ...(data.categoryId !== undefined && { category_id: data.categoryId }),
        ...(data.price !== undefined && { price: data.price }),
      },
      include: { category: true },
    });
  }

  async delete(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getProductAvailability(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        store_products: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return {
      ...product,
      availability: product.store_products.map((sp) => ({
        storeId: sp.store.id,
        storeName: sp.store.name,
        quantity: sp.quantity,
      })),
    };
  }

  async addToStore(storeId: number, data: AddProductToStoreDTO) {
    return this.prisma.storeProduct.create({
      data: {
        store_id: storeId,
        product_id: data.productId,
        quantity: data.quantity,
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async findByStore(storeId: number) {
    const storeProducts = await this.prisma.storeProduct.findMany({
      where: { store_id: storeId },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    return storeProducts.map((sp) => ({
      ...sp.product,
      quantity: sp.quantity,
    }));
  }

  async updateInStore(storeId: number, productId: number, data: UpdateStoreProductDTO) {
    return this.prisma.storeProduct.update({
      where: {
        store_id_product_id: {
          store_id: storeId,
          product_id: productId,
        },
      },
      data: {
        ...(data.quantity !== undefined && { quantity: data.quantity }),
      },
      include: {
        product: true,
        store: true,
      },
    });
  }

  async removeFromStore(storeId: number, productId: number) {
    return this.prisma.storeProduct.delete({
      where: {
        store_id_product_id: {
          store_id: storeId,
          product_id: productId,
        },
      },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.product.count({
      where: { id },
    });
    return count > 0;
  }
}
