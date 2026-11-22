import { pool } from "../../db/pool";
import { UserRole } from "../users/users.types";
import { AuthUser, AuthUserWithHash } from "./auth.types";

export const authRepository = {
  findByEmail: async (email: string): Promise<AuthUserWithHash | undefined> => {
    const { rows } = await pool.query<AuthUserWithHash>(
      `SELECT id, username, email, role, password_hash AS "passwordHash"
       FROM users
       WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  create: async (data: {
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    title: string;
  }): Promise<AuthUser> => {
    const { rows } = await pool.query<AuthUser>(
      `INSERT INTO users (username, email, password_hash, role, title)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, role`,
      [data.username, data.email, data.passwordHash, data.role, data.title]
    );
    return rows[0];
  },

  saveRefreshToken: async (
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> => {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  },

  consumeRefreshToken: async (tokenHash: string): Promise<AuthUser | undefined> => {
    const { rows } = await pool.query<AuthUser>(
      `UPDATE refresh_tokens rt
       SET revoked_at = now()
       FROM users u
       WHERE rt.token_hash = $1
         AND rt.revoked_at IS NULL
         AND rt.expires_at > now()
         AND u.id = rt.user_id
       RETURNING u.id, u.username, u.email, u.role`,
      [tokenHash]
    );
    return rows[0];
  },

  revokeRefreshToken: async (tokenHash: string): Promise<void> => {
    await pool.query(
      `UPDATE refresh_tokens
       SET revoked_at = now()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash]
    );
  },
};
