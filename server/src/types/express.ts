import { AuthTokenPayload } from "../features/auth/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
