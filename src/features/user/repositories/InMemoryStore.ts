import { UserModel } from '../models/User';

import { ProfileModel } from '../models/Profile';

/**
 * Provides process-wide shared in-memory stores for repositories.
 * Uses globalThis to persist across module reloads in dev.
 */
export function getGlobalStore() {
  const g = globalThis as any;

  if (!g.__SUPER_GOLF_STORE__) {
    g.__SUPER_GOLF_STORE__ = {
      users: [] as UserModel[],
      profiles: [] as ProfileModel[],
    };
  }

  return g.__SUPER_GOLF_STORE__ as {
    users: UserModel[];
    profiles: ProfileModel[];
  };
}

/**
 * Returns the shared users store (in-memory).
 */
export function getUsersStore(): UserModel[] {
  return getGlobalStore().users;
}

/**
 * Returns the shared profiles store (in-memory).
 */
export function getProfilesStore(): ProfileModel[] {
  return getGlobalStore().profiles;
}