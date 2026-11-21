import { Router } from "express";
import { getMyVotes } from "./votes.controller";

// Pasa por requireAuth (ver app.ts). Votar se hace en /rooms/:code/votes
export const votesRouter = Router();

votesRouter.get("/mine", getMyVotes);
