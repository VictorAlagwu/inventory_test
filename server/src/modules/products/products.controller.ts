import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductService } from '@/modules/products/products.service';
import { ProductRepository } from '@/modules/products/products.repository';
import { prisma } from '@/lib/db';
import { success } from '@/utils/jsend';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productFiltersSchema,
  paginationSchema,
} from '@/modules/products/products.schemas';
import {
  addProductToStoreSchema,
  updateStoreProductSchema,
  storeIdParamSchema,
  storeProductParamsSchema,
} from '@/modules/stores/stores.schemas';

const productRepository = new ProductRepository(prisma);
const productService = new ProductService(productRepository);

export const getProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  const filters = productFiltersSchema.parse(request.query);
  const pagination = paginationSchema.parse(request.query);

  const result = await productService.getAllProducts(filters, pagination);
  return reply.status(200).send(success(result));
};

export const getProductById = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = productIdSchema.parse(request.params);
  const product = await productService.getProductById(id);
  return reply.status(200).send(success(product));
};

export const createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = createProductSchema.parse(request.body);
  const product = await productService.createProduct(data);
  return reply.status(201).send(success(product));
};

export const updateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = productIdSchema.parse(request.params);
  const data = updateProductSchema.parse(request.body);
  const product = await productService.updateProduct(id, data);
  return reply.status(200).send(success(product));
};

export const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = productIdSchema.parse(request.params);
  await productService.deleteProduct(id);
  return reply.status(200).send(success(null));
};

export const getProductAvailability = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = productIdSchema.parse(request.params);
  const availability = await productService.getProductAvailability(id);
  return reply.status(200).send(success(availability));
};

export const addProductToStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const { storeId } = storeIdParamSchema.parse(request.params);
  const data = addProductToStoreSchema.parse(request.body);
  const result = await productService.addProductToStore(storeId, data);
  return reply.status(201).send(success(result));
};

export const getStoreProducts = async (request: FastifyRequest, reply: FastifyReply) => {
  const { storeId } = storeIdParamSchema.parse(request.params);
  const products = await productService.getStoreProducts(storeId);
  return reply.status(200).send(success(products));
};

export const updateProductInStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const { storeId, productId } = storeProductParamsSchema.parse(request.params);
  const data = updateStoreProductSchema.parse(request.body);
  const result = await productService.updateProductInStore(storeId, productId, data);
  return reply.status(200).send(success(result));
};

export const removeProductFromStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const { storeId, productId } = storeProductParamsSchema.parse(request.params);
  await productService.removeProductFromStore(storeId, productId);
  return reply.status(200).send(success(null));
};
