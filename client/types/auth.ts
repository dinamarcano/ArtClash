import { UserRole } from "./users";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
}

// Lo que devuelven login, registro y refresh
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
  role: UserRole;
}
