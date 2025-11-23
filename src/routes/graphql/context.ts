import { PrismaClient } from '@prisma/client';
import { createLoaders } from './loaders.js';

export type GraphQLContext = {
  prisma: PrismaClient;
  loaders: ReturnType<typeof createLoaders>;
};
