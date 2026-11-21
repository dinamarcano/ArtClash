import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../users/users.types";
import { verifyAccessToken } from "./auth.tokens";

// Exige un access token válido en el header "Authorization: Bearer <token>".
// Responde 401 si falta o venció: el interceptor del cliente usa ese 401
// como señal para renovar el token automáticamente.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ message: "Necesitas iniciar sesión" });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    const expired = error instanceof jwt.TokenExpiredError;
    res.status(401).json({
      message: expired ? "Tu sesión expiró" : "Token inválido",
    });
  }
};

// Se usa DESPUÉS de requireAuth. 403 = sé quién eres, pero no tienes permiso.
export const requireRole =
  (role: UserRole) => (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ message: "No tienes permiso para hacer esto" });
      return;
    }
    next();
  };
