import { Router } from "express";
import { getMyVotes } from "./votes.controller";

export const votesRouter = Router();

votesRouter.get("/mine", getMyVotes);
