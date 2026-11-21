import { AuthTokenPayload } from "../features/auth/auth.types";

// Le enseña a TypeScript que, tras requireAuth, req.user existe
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
