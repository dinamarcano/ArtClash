import { UserRole } from "../users/users.types";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthUserWithHash extends AuthUser {
  passwordHash: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: number;
  username: string;
  role: UserRole;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}
