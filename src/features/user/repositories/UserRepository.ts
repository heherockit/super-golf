import { prisma } from '@/lib/prisma';
import { UserModel } from '../models/User';

/**
 * Repository interface for user data access.
 */
export interface IUserRepository {
  /** Finds a user by email or returns null. */
  findByEmail(email: string): Promise<UserModel | null>;

  /** Creates a new user and returns the created model. */
  create(data: { name: string; email: string; passwordHash: string }): Promise<UserModel>;
}

/**
 * Prisma-backed implementation of the user repository.
 */
export class PrismaUserRepository implements IUserRepository {
  /**
   * Finds a user by email using Prisma.
   */
  async findByEmail(email: string): Promise<UserModel | null> {
    const u = await prisma.user.findUnique({ where: { email } });

    return u ? UserModel.fromPrisma(u) : null;
  }

  /**
   * Creates a new user using Prisma.
   */
  async create(data: { name: string; email: string; passwordHash: string }): Promise<UserModel> {
    const u = await prisma.user.create({ data });

    return UserModel.fromPrisma(u);
  }
}