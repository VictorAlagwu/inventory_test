import { prisma } from '../lib/db';
import type { Store, Product, Category } from '../../generated/prisma';

export const createTestCategory = async (name: string = `Test Category ${Date.now()}`): Promise<Category> => {
  return prisma.category.create({
    data: { name },
  });
};

export const getOrCreateCategory = async (name: string): Promise<Category> => {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.category.create({ data: { name } });
};

export const createTestStore = async (override?: Partial<Store>): Promise<Store> => {
  return prisma.store.create({
    data: {
      name: override?.name || `Test Store ${Date.now()}`,
      location: override?.location || 'Test Location',
      description: override?.description || 'Test store description',
    },
  });
};

export const createTestProduct = async (
  override?: Partial<Omit<Product, 'category_id'>> & { categoryId?: number }
): Promise<Product> => {
  let categoryId = override?.categoryId;
  if (!categoryId) {
    const category = await getOrCreateCategory('Other');
    categoryId = category.id;
  }

  return prisma.product.create({
    data: {
      name: override?.name || `Test Product ${Date.now()}`,
      description: override?.description || 'Test product description',
      category_id: categoryId,
      price: override?.price || 99.99,
    },
  });
};

export const addProductToStore = async (
  storeId: number,
  productId: number,
  quantity: number = 10
) => {
  return prisma.storeProduct.create({
    data: {
      store_id: storeId,
      product_id: productId,
      quantity,
    },
    include: {
      store: true,
      product: true,
    },
  });
};

export const cleanDatabase = async () => {
  await prisma.storeProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.category.deleteMany({});
};
