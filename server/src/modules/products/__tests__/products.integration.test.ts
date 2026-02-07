import { buildApp } from '../../../app';
import { createTestStore, createTestProduct, createTestCategory, addProductToStore } from '../../../tests/helpers';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Products API Integration Tests', () => {
  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const category = await createTestCategory('Electronics');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'New Product',
          categoryId: category.id,
          price: 299.99,
          description: 'A new product',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toMatchObject({
        name: 'New Product',
        category_id: category.id,
        price: 299.99,
      });
    });

    it('should validate price is positive', async () => {
      const category = await createTestCategory('Other');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/products',
        payload: {
          name: 'Invalid Product',
          categoryId: category.id,
          price: -10,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.status).toBe('fail');
    });
  });

  describe('GET /api/v1/products (with filtering and pagination)', () => {
    let electronicsCategoryId: number;
    let furnitureCategoryId: number;

    beforeEach(async () => {
      const electronics = await createTestCategory('Electronics');
      const furniture = await createTestCategory('Furniture');
      electronicsCategoryId = electronics.id;
      furnitureCategoryId = furniture.id;

      await createTestProduct({ name: 'Laptop', categoryId: electronicsCategoryId, price: 999 });
      await createTestProduct({ name: 'Mouse', categoryId: electronicsCategoryId, price: 25 });
      await createTestProduct({ name: 'Desk', categoryId: furnitureCategoryId, price: 350 });
      await createTestProduct({ name: 'Chair', categoryId: furnitureCategoryId, price: 150 });
      await createTestProduct({ name: 'Monitor', categoryId: electronicsCategoryId, price: 400 });
    });

    it('should return all products with default pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.items.length).toBeLessThanOrEqual(10);
      expect(body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: 5,
      });
    });

    it('should filter by categoryId', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products?categoryId=${electronicsCategoryId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(3);
      expect(body.data.items.every((p: any) => p.category_id === electronicsCategoryId)).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?minPrice=100&maxPrice=500',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(3); // Desk (350), Chair (150), Monitor (400)
      expect(
        body.data.items.every((p: any) => p.price >= 100 && p.price <= 500)
      ).toBe(true);
    });

    it('should paginate results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?page=1&limit=2',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 5,
        totalPages: 3,
      });
    });

    it('should sort by price', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/products?sortBy=price&sortOrder=asc',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      const prices = body.data.items.map((p: any) => p.price);
      expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
    });

    it('should combine filters, sorting, and pagination', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products?categoryId=${electronicsCategoryId}&minPrice=50&sortBy=price&sortOrder=desc&page=1&limit=2`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.data.items).toHaveLength(2);
      expect(body.data.items.every((p: any) => p.category_id === electronicsCategoryId)).toBe(true);
      expect(body.data.items.every((p: any) => p.price >= 50)).toBe(true);
      // Check descending price order
      expect(body.data.items[0].price).toBeGreaterThanOrEqual(
        body.data.items[1].price
      );
    });
  });

  describe('GET /api/v1/products/:id/availability (Non-trivial operation)', () => {
    it('should return product availability across stores', async () => {
      const product = await createTestProduct({ name: 'Multi-Store Product' });
      const store1 = await createTestStore({ name: 'Store A' });
      const store2 = await createTestStore({ name: 'Store B' });
      const store3 = await createTestStore({ name: 'Store C' });

      await addProductToStore(store1.id, product.id, 50);
      await addProductToStore(store2.id, product.id, 25);
      await addProductToStore(store3.id, product.id, 0); // Out of stock

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${product.id}/availability`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.availability).toHaveLength(3);
      expect(body.data.availability).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ storeName: 'Store A', quantity: 50 }),
          expect.objectContaining({ storeName: 'Store B', quantity: 25 }),
          expect.objectContaining({ storeName: 'Store C', quantity: 0 }),
        ])
      );
    });

    it('should return empty availability for product not in any store', async () => {
      const product = await createTestProduct({ name: 'Unassigned Product' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/products/${product.id}/availability`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.availability).toHaveLength(0);
    });
  });

  describe('Store-Product Association', () => {
    it('should add product to store', async () => {
      const store = await createTestStore();
      const product = await createTestProduct();

      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/stores/${store.id}/products`,
        payload: {
          productId: product.id,
          quantity: 100,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.quantity).toBe(100);
    });

    it('should get products for a store', async () => {
      const store = await createTestStore();
      const product1 = await createTestProduct({ name: 'Product 1' });
      const product2 = await createTestProduct({ name: 'Product 2' });

      await addProductToStore(store.id, product1.id, 10);
      await addProductToStore(store.id, product2.id, 20);

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/stores/${store.id}/products`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(2);
    });

    it('should update product quantity in store', async () => {
      const store = await createTestStore();
      const product = await createTestProduct();
      await addProductToStore(store.id, product.id, 10);

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/stores/${store.id}/products/${product.id}`,
        payload: { quantity: 50 },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.quantity).toBe(50);
    });

    it('should remove product from store', async () => {
      const store = await createTestStore();
      const product = await createTestProduct();
      await addProductToStore(store.id, product.id, 10);

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/stores/${store.id}/products/${product.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toBeNull();
    });
  });
});
