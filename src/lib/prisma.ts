import { PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances in dev
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Returns a singleton PrismaClient instance for database access.
 */
export function getPrisma(): PrismaClient {
  if (global.prisma) return global.prisma;

  global.prisma = new PrismaClient();

  return global.prisma;
}

export const prisma = getPrisma();
