import { prisma } from '@/lib/prisma';
import { ProfileModel } from '../models/Profile';
import type { Prisma, Profile } from '@prisma/client';

/**
 * Repository interface for profile data access.
 */
export interface IProfileRepository {
  /** Finds a profile by userId (email) or returns null. */
  findByUserId(userId: string): Promise<ProfileModel | null>;

  /** Upserts profile for given userId with provided data. */
  upsert(userId: string, data: Partial<ProfileModel>): Promise<ProfileModel>;
}

/**
 * Prisma-backed implementation of the profile repository.
 */
export class PrismaProfileRepository implements IProfileRepository {
  /**
   * Finds a profile by userId using Prisma.
   */
  async findByUserId(userId: string): Promise<ProfileModel | null> {
    const p: Profile | null = await prisma.profile.findUnique({ where: { userId } });

    return p ? ProfileModel.fromPrisma(p) : null;
  }

  /**
   * Upserts profile using Prisma.
   */
  async upsert(userId: string, data: Partial<ProfileModel>): Promise<ProfileModel> {
    const updateData: Prisma.ProfileUncheckedUpdateInput = { ...(data as any) };

    const createData: Prisma.ProfileUncheckedCreateInput = { userId, ...(data as any) };

    const updated: Profile = await prisma.profile.upsert({
      where: { userId },
      update: updateData,
      create: createData,
    });

    return ProfileModel.fromPrisma(updated);
  }
}