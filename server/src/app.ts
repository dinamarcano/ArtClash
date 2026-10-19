import express from "express";
import cors from "cors";
import { productsRouter } from "./features/products/products.router";
import { clientsRouter } from "./features/clients/clients.router";
import { paymentsRouter } from "./features/payments/payments.router";

export const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/products", productsRouter);
app.use("/clients", clientsRouter);
app.use("/payments", paymentsRouter);

export default app;