import { Router } from "express";
import { getPaymentById, getPayments } from "./payments.controller";

export const paymentsRouter = Router();

paymentsRouter.get("/", getPayments);
paymentsRouter.get("/:id", getPaymentById);