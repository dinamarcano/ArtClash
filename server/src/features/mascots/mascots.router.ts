import { Router } from "express";
import { requireRole } from "../auth/auth.middleware";
import {
  createMascot,
  deleteMascot,
  getMascotById,
  getMascots,
  getMascotsRanking,
  getMyMascots,
} from "./mascots.controller";

// Todas las rutas ya pasan por requireAuth (ver app.ts)
export const mascotsRouter = Router();

mascotsRouter.get("/", getMascots);
mascotsRouter.get("/ranking", getMascotsRanking);
// "/mine" va antes de "/:id"; si no, Express creería que "mine" es un id
mascotsRouter.get("/mine", requireRole("artist"), getMyMascots);
mascotsRouter.get("/:id", getMascotById);

// Solo artistas pueden subir y borrar arte
mascotsRouter.post("/", requireRole("artist"), createMascot);
mascotsRouter.delete("/:id", requireRole("artist"), deleteMascot);
