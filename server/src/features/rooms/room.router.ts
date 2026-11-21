import { Router } from "express";
import { requireRole } from "../auth/auth.middleware";
import { createRoom, getRoomByCode, startRoom, voteInRoom } from "./rooms.controller";

// Todas las rutas ya pasan por requireAuth (ver app.ts)
export const roomsRouter = Router();

// Cualquiera con sesión puede entrar a una sala con su código
roomsRouter.get("/:code", getRoomByCode);

// Solo artistas crean e inician votaciones
roomsRouter.post("/", requireRole("artist"), createRoom);
roomsRouter.post("/:code/start", requireRole("artist"), startRoom);

// Solo fans votan: los artistas compiten, no votan
roomsRouter.post("/:code/votes", requireRole("user"), voteInRoom);
