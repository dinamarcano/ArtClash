import { Router } from "express";
import { getProductById, getProducts } from "./mascots.controller";

export const productsRouter = Router();

productsRouter.get("/", getProducts);
productsRouter.get("/:id", getProductById);