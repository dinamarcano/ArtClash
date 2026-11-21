import { UserRole } from "../users/users.types";

// Datos públicos del usuario que viajan con la sesión
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

// Solo para uso interno del servidor: incluye el hash para comparar la contraseña
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

// Lo que va dentro del access token y queda en req.user tras el middleware
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
