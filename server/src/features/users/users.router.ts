import { Router } from "express";
import { getUserById, getUsers } from "./users.controller";

export const usersRouter = Router();

usersRouter.get("/", getUsers);
usersRouter.get("/:id", getUserById);