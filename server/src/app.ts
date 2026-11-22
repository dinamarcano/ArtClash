import "./types/express";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { votesRouter } from "./features/votes/votes.router";
import { mascotsRouter } from "./features/mascots/mascots.router";
import { roomsRouter } from "./features/rooms/room.router";
import { authRouter } from "./features/auth/auth.router";
import { requireAuth } from "./features/auth/auth.middleware";
import { HttpError } from "./lib/httpError";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/votes", requireAuth, votesRouter);
app.use("/mascots", requireAuth, mascotsRouter);
app.use("/rooms", requireAuth, roomsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  if ((err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ message: "El cuerpo de la petición no es JSON válido" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor" });
});

export default app;
