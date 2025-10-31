import { UserModel } from '../models/User';

import { getUsersStore } from './InMemoryStore';

/**
 * In-memory implementation of the user repository using a process-local array.
 * Intended for development/testing without a database.
 */
export interface IUserRepository {
  /** Finds a user by email or returns null. */
  findByEmail(email: string): Promise<UserModel | null>;

  /** Creates a new user and returns the created model. */
  create(data: { name: string; email: string; passwordHash: string }): Promise<UserModel>;
}

/**
 * InMemoryUserRepository stores users in a local array for quick prototyping.
 */
export class InMemoryUserRepository implements IUserRepository {
  private users: UserModel[] = getUsersStore();

  /**
   * Finds a user by email from the in-memory store.
   */
  async findByEmail(email: string): Promise<UserModel | null> {
    const u = this.users.find((x) => x.email === email);

    return u ?? null;
  }

  /**
   * Creates a new user and stores it in memory.
   */
  async create(data: { name: string; email: string; passwordHash: string }): Promise<UserModel> {
    const id = `u_${Math.random().toString(36).slice(2)}`;

    const model = new UserModel(id, data.name, data.email, data.passwordHash, null);

    this.users.push(model);

    return model;
  }
}