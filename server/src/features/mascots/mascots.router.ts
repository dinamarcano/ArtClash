import { Router } from "express";
import { getMascotById, getMascots, getMascotsRanking } from "./mascots.controller";

export const mascotsRouter = Router();

mascotsRouter.get("/", getMascots);
mascotsRouter.get("/ranking", getMascotsRanking);
mascotsRouter.get("/:id", getMascotById);