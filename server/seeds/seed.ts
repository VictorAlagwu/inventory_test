import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { categoriesSeeds } from './categories.seed';
import { storesSeed } from './stores.seed';
import { productsSeed } from './products.seed';
import { storeProductsSeed } from './storeProducts.seed';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.storeProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.category.deleteMany({});

  // Reset auto-increment sequences so IDs start from 1
  await prisma.$executeRaw`ALTER SEQUENCE categories_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE stores_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE products_id_seq RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE store_products_id_seq RESTART WITH 1`;

  console.log('Creating categories...');
  const categories: Awaited<ReturnType<typeof prisma.category.create>>[] = [];
  for (const category of categoriesSeeds) {
    const created = await prisma.category.create({
      data: { name: category.name },
    });
    categories.push(created);
  }

  const categoryIdMap = new Map<number, number>();
  categoriesSeeds.forEach((seedCat, index) => {
    const created = categories[index];
    if (created) {
      categoryIdMap.set(seedCat.id, created.id);
    }
  });

  console.log('Creating stores...');
  const stores: Awaited<ReturnType<typeof prisma.store.create>>[] = [];
  for (const store of storesSeed) {
    const created = await prisma.store.create({
      data: {
        name: store.name,
        location: store.location,
        description: store.description,
      },
    });
    stores.push(created);
  }

  console.log('Creating products...');
  const products: Awaited<ReturnType<typeof prisma.product.create>>[] = [];
  for (const prod of productsSeed) {
    const actualCategoryId = categoryIdMap.get(prod.category_id);
    if (!actualCategoryId) {
      console.warn(`Skipping product "${prod.name}": category_id ${prod.category_id} not found`);
      continue;
    }
    const created = await prisma.product.create({
      data: {
        name: prod.name,
        description: prod.description,
        category_id: actualCategoryId,
        price: prod.price,
      },
    });
    products.push(created);
  }

  console.log('Creating store-product associations...');
  let associationCount = 0;
  for (const assoc of storeProductsSeed) {
    const store = stores[assoc.storeIndex];
    const product = products[assoc.productIndex];
    if (!store || !product) {
      console.warn(`Skipping association: store[${assoc.storeIndex}] or product[${assoc.productIndex}] not found`);
      continue;
    }
    await prisma.storeProduct.create({
      data: {
        store_id: store.id,
        product_id: product.id,
        quantity: assoc.quantity,
      },
    });
    associationCount++;
  }

  console.log('Seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`   - ${categories.length} categories`);
  console.log(`   - ${stores.length} stores`);
  console.log(`   - ${products.length} products`);
  console.log(`   - ${associationCount} store-product associations`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
