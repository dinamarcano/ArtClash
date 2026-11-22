import { Router } from "express";
import { requireRole } from "../auth/auth.middleware";
import { createRoom, getRoomByCode, startRoom, voteInRoom } from "./rooms.controller";

export const roomsRouter = Router();

roomsRouter.get("/:code", getRoomByCode);

roomsRouter.post("/", requireRole("artist"), createRoom);
roomsRouter.post("/:code/start", requireRole("artist"), startRoom);

roomsRouter.post("/:code/votes", requireRole("user"), voteInRoom);
