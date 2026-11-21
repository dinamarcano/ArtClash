import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { votesRouter } from "./features/votes/votes.router";
import { mascotsRouter } from "./features/mascots/mascots.router";
import { usersRouter } from "./features/users/users.router";
import { roomsRouter } from "./features/rooms/room.router";
import { authRouter } from "./features/auth/auth.router";
import { requireAuth } from "./features/auth/auth.middleware";
import { HttpError } from "./lib/httpError";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
// Permite leer el cuerpo JSON de los POST (req.body)
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// Públicas: registrarse, entrar, renovar y salir
app.use("/auth", authRouter);
// Privadas: requireAuth revisa el token antes de llegar al router
app.use("/votes", requireAuth, votesRouter);
app.use("/mascots", requireAuth, mascotsRouter);
app.use("/users", requireAuth, usersRouter);
app.use("/rooms", requireAuth, roomsRouter);

// Manejador central de errores: Express 5 envía aquí cualquier error
// lanzado en un controller async, y siempre respondemos JSON
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  // JSON mal formado en el cuerpo de la petición
  if ((err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "El cuerpo de la petición no es JSON válido" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;
