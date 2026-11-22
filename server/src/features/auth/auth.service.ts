import bcrypt from "bcryptjs";
import { HttpError } from "../../lib/httpError";
import { authRepository } from "./auth.repository";
import {
  generateRefreshToken,
  hashToken,
  REFRESH_TOKEN_TTL_MS,
  signAccessToken,
} from "./auth.tokens";
import { AuthSession, AuthUser, LoginInput, RegisterInput } from "./auth.types";

const BCRYPT_ROUNDS = 10;
const PG_UNIQUE_VIOLATION = "23505";

const createSession = async (user: AuthUser): Promise<AuthSession> => {
  const refreshToken = generateRefreshToken();
  await authRepository.saveRefreshToken(
    user.id,
    hashToken(refreshToken),
    new Date(Date.now() + REFRESH_TOKEN_TTL_MS)
  );
  return { user, accessToken: signAccessToken(user), refreshToken };
};

export const authService = {
  register: async (input: RegisterInput): Promise<AuthSession> => {
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await authRepository.create({
        username: input.username,
        email: input.email,
        passwordHash,
        role: input.role,
        title: input.role === "artist" ? "Artist" : "Rookie",
      });
      return createSession(user);
    } catch (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new HttpError(409, "Ese usuario o email ya está registrado");
      }
      throw error;
    }
  },

  login: async (input: LoginInput): Promise<AuthSession> => {
    const found = await authRepository.findByEmail(input.email);
    const valid = found && (await bcrypt.compare(input.password, found.passwordHash));

    if (!found || !valid) {
      throw new HttpError(401, "Email o contraseña incorrectos");
    }

    const { passwordHash: _hash, ...user } = found;
    return createSession(user);
  },

  refresh: async (refreshToken: string): Promise<AuthSession> => {
    const user = await authRepository.consumeRefreshToken(hashToken(refreshToken));
    if (!user) {
      throw new HttpError(401, "Tu sesión expiró, vuelve a iniciar sesión");
    }
    return createSession(user);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await authRepository.revokeRefreshToken(hashToken(refreshToken));
  },
};
