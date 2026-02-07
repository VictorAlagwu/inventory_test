import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.test'), override: true });

import { prisma, pool } from '../lib/db';

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.includes('_test')) {
    throw new Error(
      `Refusing to run tests against a non-test database: ${dbUrl}\n` +
      'The DATABASE_URL must contain "_test" to prevent accidental data loss.\n' +
      'Create a test database (e.g., inventory_test) and set it in .env.test.'
    );
  }
});

afterEach(async () => {
  await prisma.storeProduct.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.category.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
  await pool.end();
});
