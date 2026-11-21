import { AuthTokenPayload } from "../features/auth/auth.types";

// Le enseña a TypeScript que, tras requireAuth, req.user existe.
// Es un .ts normal (no .d.ts) y se importa desde app.ts: Vercel compila
// siguiendo los imports desde la entrada, y un archivo que nadie importa
// quedaría fuera de la compilación.
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
