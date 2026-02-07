import { buildApp } from '../../../app';
import { createTestStore, createTestProduct, addProductToStore } from '../../../tests/helpers';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Stores API Integration Tests', () => {
  describe('POST /api/v1/stores', () => {
    it('should create a new store', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/stores',
        payload: {
          name: 'New Store',
          location: 'New York',
          description: 'A new store',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toMatchObject({
        name: 'New Store',
        location: 'New York',
        description: 'A new store',
      });
      expect(body.data.id).toBeDefined();
    });

    it('should reject store with duplicate name', async () => {
      await createTestStore({ name: 'Duplicate Store' });

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/stores',
        payload: {
          name: 'Duplicate Store',
          location: 'Boston',
        },
      });

      expect(response.statusCode).toBe(409);
      const body = response.json();
      expect(body.status).toBe('fail');
      expect(body.data.code).toBe('DUPLICATE_STORE_NAME');
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/stores',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      const body = response.json();
      expect(body.status).toBe('fail');
      expect(body.data.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/stores', () => {
    it('should return all stores', async () => {
      await createTestStore({ name: 'Store A' });
      await createTestStore({ name: 'Store B' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stores',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(2);
    });

    it('should filter stores by name', async () => {
      await createTestStore({ name: 'Apple Store' });
      await createTestStore({ name: 'Best Buy' });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stores?name=apple',
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toHaveLength(1);
      expect(body.data[0].name).toContain('Apple');
    });
  });

  describe('GET /api/v1/stores/:id', () => {
    it('should return a store by ID', async () => {
      const store = await createTestStore({ name: 'Test Store' });

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/stores/${store.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.id).toBe(store.id);
      expect(body.data.name).toBe('Test Store');
    });

    it('should return 404 for non-existent store', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/stores/999999',
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.status).toBe('fail');
      expect(body.data.code).toBe('STORE_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/stores/:id', () => {
    it('should update a store', async () => {
      const store = await createTestStore({ name: 'Old Name' });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/v1/stores/${store.id}`,
        payload: {
          name: 'New Name',
          location: 'Updated Location',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.name).toBe('New Name');
      expect(body.data.location).toBe('Updated Location');
    });
  });

  describe('DELETE /api/v1/stores/:id', () => {
    it('should delete a store', async () => {
      const store = await createTestStore();

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/stores/${store.id}`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data).toBeNull();

      // Verify deletion
      const getResponse = await app.inject({
        method: 'GET',
        url: `/api/v1/stores/${store.id}`,
      });
      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/stores/:id/summary (Non-trivial operation)', () => {
    it('should return store inventory summary', async () => {
      const store = await createTestStore({ name: 'Summary Store' });
      const product1 = await createTestProduct({ name: 'Product 1', price: 100 });
      const product2 = await createTestProduct({ name: 'Product 2', price: 50 });
      const product3 = await createTestProduct({ name: 'Product 3', price: 25 });

      await addProductToStore(store.id, product1.id, 5); // Value: 500, low stock (<10)
      await addProductToStore(store.id, product2.id, 20); // Value: 1000
      await addProductToStore(store.id, product3.id, 3); // Value: 75, low stock (<10)

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/stores/${store.id}/summary`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.summary).toMatchObject({
        totalProducts: 3,
        totalInventoryValue: 1575,
        lowStockCount: 2, // product1 (qty 5) and product3 (qty 3) both below threshold of 10
      });
    });

    it('should return empty summary for store with no products', async () => {
      const store = await createTestStore();

      const response = await app.inject({
        method: 'GET',
        url: `/api/v1/stores/${store.id}/summary`,
      });

      expect(response.statusCode).toBe(200);
      const body = response.json();
      expect(body.status).toBe('success');
      expect(body.data.summary).toMatchObject({
        totalProducts: 0,
        totalInventoryValue: 0,
        lowStockCount: 0,
      });
    });
  });
});
