import { FastifyInstance } from 'fastify';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductAvailability,
} from '@/modules/products/products.controller';

export async function productsRoutes(fastify: FastifyInstance) {
  fastify.get('/', getProducts);
  fastify.post('/', createProduct);

  fastify.get('/:id/availability', getProductAvailability);

  fastify.get('/:id', getProductById);
  fastify.put('/:id', updateProduct);
  fastify.delete('/:id', deleteProduct);
}
