import { FastifyInstance } from 'fastify';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreSummary,
} from '@/modules/stores/stores.controller';
import {
  addProductToStore,
  getStoreProducts,
  updateProductInStore,
  removeProductFromStore,
} from '@/modules/products/products.controller';

export async function storesRoutes(fastify: FastifyInstance) {
  fastify.get('/', getStores);
  fastify.post('/', createStore);

  fastify.get('/:id/summary', getStoreSummary);

  fastify.get('/:id', getStoreById);
  fastify.put('/:id', updateStore);
  fastify.delete('/:id', deleteStore);

  fastify.post('/:storeId/products', addProductToStore);
  fastify.get('/:storeId/products', getStoreProducts);
  fastify.put('/:storeId/products/:productId', updateProductInStore);
  fastify.delete('/:storeId/products/:productId', removeProductFromStore);
}
