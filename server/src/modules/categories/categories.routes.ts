import { FastifyInstance } from 'fastify';
import { getCategories } from '@/modules/categories/categories.controller';

export async function categoriesRoutes(fastify: FastifyInstance) {
  fastify.get('/', getCategories);
}
