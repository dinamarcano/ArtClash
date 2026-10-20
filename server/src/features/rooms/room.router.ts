import { Router } from "express";
import { getRoomByCode } from "./rooms.controller";

export const roomsRouter = Router();

roomsRouter.get("/:code", getRoomByCode);