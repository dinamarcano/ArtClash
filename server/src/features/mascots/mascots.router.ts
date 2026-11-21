import { Router } from "express";
import { requireRole } from "../auth/auth.middleware";
import {
  createMascot,
  deleteMascot,
  getMascots,
  getMascotsRanking,
  getMyMascots,
} from "./mascots.controller";

// Todas las rutas ya pasan por requireAuth (ver app.ts)
export const mascotsRouter = Router();

mascotsRouter.get("/", getMascots);
mascotsRouter.get("/ranking", getMascotsRanking);
mascotsRouter.get("/mine", requireRole("artist"), getMyMascots);

// Solo artistas pueden subir y borrar arte
mascotsRouter.post("/", requireRole("artist"), createMascot);
mascotsRouter.delete("/:id", requireRole("artist"), deleteMascot);
