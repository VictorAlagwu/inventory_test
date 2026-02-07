import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { ZodError } from 'zod';
import { success, fail, error } from '@/utils/jsend';
import { productsRoutes } from '@/modules/products/products.routes';
import { storesRoutes } from '@/modules/stores/stores.routes';
import { categoriesRoutes } from '@/modules/categories/categories.routes';

export async function buildApp() {
  const fastify = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  // Global error handler — must be set before registering routes
  fastify.setErrorHandler((err: Error, request, reply) => {
    // Zod validation errors → JSend fail
    if (err instanceof ZodError || err.name === 'ZodError') {
      return reply.status(400).send(fail({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: (err as any).issues,
      }));
    }

    // Application errors with statusCode (404, 409, etc.) → JSend fail
    const statusCode = (err as any).statusCode;
    if (typeof statusCode === 'number' && statusCode < 500) {
      return reply.status(statusCode).send(fail({
        message: err.message,
        code: (err as any).code,
      }));
    }

    // Everything else → JSend error (5xx)
    return reply.status(500).send(error('Internal server error', 'INTERNAL_ERROR'));
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send(fail({
      message: 'Route not found',
      code: 'NOT_FOUND',
    }));
  });

  // Plugins
  await fastify.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  await fastify.register(helmet, {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // Health check
  fastify.get('/api/v1/health', async () => {
    return success({ timestamp: new Date().toISOString() });
  });

  // Routes
  await fastify.register(categoriesRoutes, { prefix: '/api/v1/categories' });
  await fastify.register(productsRoutes, { prefix: '/api/v1/products' });
  await fastify.register(storesRoutes, { prefix: '/api/v1/stores' });

  return fastify;
}
