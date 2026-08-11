import * as argon2 from 'argon2';

export class PasswordUtil {
  /**
   * Hashes plain text password using Argon2id algorithm
   */
  public static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifies plain text password against Argon2 hash
   */
  public static async verifyPassword(
    hash: string,
    plain: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }
}
