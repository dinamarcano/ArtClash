import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { AuthTokenPayload, AuthUser } from "./auth.types";

// Access token corto: si alguien lo roba, sirve poco tiempo
const ACCESS_TOKEN_TTL = "15m";
// Refresh token largo: permite renovar sin volver a pedir la contraseña
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Falta la variable de entorno JWT_ACCESS_SECRET");
  return secret;
};

// JWT firmado: el servidor lo verifica sin consultar la base
export const signAccessToken = (user: AuthUser): string =>
  jwt.sign({ sub: String(user.id), username: user.username, role: user.role }, getAccessSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });

// Verifica firma y vencimiento; lanza un error si el token no sirve
export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, getAccessSecret()) as jwt.JwtPayload;
  return {
    id: Number(payload.sub),
    username: payload.username,
    role: payload.role,
  };
};

// El refresh token NO es un JWT: es un valor aleatorio que se guarda en la
// base (hasheado), así se puede revocar en el logout
export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("hex");

// SHA-256 basta (no hace falta bcrypt) porque el token ya es aleatorio y largo;
// además permite buscarlo en la base por su hash
export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
