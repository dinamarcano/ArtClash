import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { AuthTokenPayload, AuthUser } from "./auth.types";

const ACCESS_TOKEN_TTL = "15m";
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const signAccessToken = (user: AuthUser): string =>
  jwt.sign({ sub: String(user.id), username: user.username, role: user.role }, config.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, config.jwtAccessSecret) as jwt.JwtPayload;
  return {
    id: Number(payload.sub),
    username: payload.username,
    role: payload.role,
  };
};

export const generateRefreshToken = (): string =>
  crypto.randomBytes(48).toString("hex");

export const hashToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");
