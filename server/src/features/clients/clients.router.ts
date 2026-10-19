import { Router } from "express";
import { getClientById, getClients } from "./clients.controller";

export const clientsRouter = Router();

clientsRouter.get("/", getClients);
clientsRouter.get("/:id", getClientById);