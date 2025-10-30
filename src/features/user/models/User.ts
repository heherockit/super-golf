/**
 * Domain model representing an application user.
 */
export class UserModel {
  constructor(
    public id: string,
    public name: string | null,
    public email: string,
    public passwordHash: string | null,
    public image?: string | null
  ) {}

  /**
   * Maps a Prisma user record to the domain model.
   */
  static fromPrisma(u: {
    id: string;
    name: string | null;
    email: string;
    passwordHash: string | null;
    image?: string | null;
  }): UserModel {
    return new UserModel(u.id, u.name, u.email, u.passwordHash, u.image ?? null);
  }
}