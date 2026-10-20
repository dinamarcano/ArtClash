import express from "express";
import cors from "cors";
import { votesRouter } from "./features/votes/votes.router";
import { mascotsRouter } from "./features/mascots/mascots.router";
import { usersRouter } from "./features/users/users.router";
import { roomsRouter } from "./features/rooms/room.router";   
export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/votes", votesRouter);
app.use("/mascots", mascotsRouter);
app.use("/users", usersRouter);
app.use("/rooms", roomsRouter);

export default app;