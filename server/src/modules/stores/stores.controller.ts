import { FastifyRequest, FastifyReply } from 'fastify';
import { StoreService } from '@/modules/stores/stores.service';
import { StoreRepository } from '@/modules/stores/stores.repository';
import { prisma } from '@/lib/db';
import { success } from '@/utils/jsend';
import {
  createStoreSchema,
  updateStoreSchema,
  storeIdSchema,
  storeFiltersSchema,
} from '@/modules/stores/stores.schemas';

const storeRepository = new StoreRepository(prisma);
const storeService = new StoreService(storeRepository);

export const getStores = async (request: FastifyRequest, reply: FastifyReply) => {
  const filters = storeFiltersSchema.parse(request.query);
  const stores = await storeService.getAllStores(filters);
  return reply.status(200).send(success(stores));
};

export const getStoreById = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = storeIdSchema.parse(request.params);
  const store = await storeService.getStoreById(id);
  return reply.status(200).send(success(store));
};

export const createStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = createStoreSchema.parse(request.body);
  const store = await storeService.createStore(data);
  return reply.status(201).send(success(store));
};

export const updateStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = storeIdSchema.parse(request.params);
  const data = updateStoreSchema.parse(request.body);
  const store = await storeService.updateStore(id, data);
  return reply.status(200).send(success(store));
};

export const deleteStore = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = storeIdSchema.parse(request.params);
  await storeService.deleteStore(id);
  return reply.status(200).send(success(null));
};

export const getStoreSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = storeIdSchema.parse(request.params);
  const summary = await storeService.getStoreSummary(id);
  return reply.status(200).send(success(summary));
};
