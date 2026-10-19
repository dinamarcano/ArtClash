import express from "express";
import cors from "cors";
import { productsRouter } from "./features/products/products.router";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);