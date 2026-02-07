import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/lib/db';
import { success } from '@/utils/jsend';

export const getCategories = async (request: FastifyRequest, reply: FastifyReply) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  return reply.status(200).send(success(categories));
};
