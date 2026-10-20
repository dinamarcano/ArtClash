import { Router } from "express";
import { getVotes, getVoteById } from "./votes.controller";

export const votesRouter = Router();

votesRouter.get("/", getVotes);
votesRouter.get("/:id", getVoteById);