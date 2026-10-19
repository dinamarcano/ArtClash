import { Request, Response } from "express";
import { productsService } from "./products.service";

export const getProducts = async (_req: Request, res: Response) => {
  const products = await productsService.getAll();
  res.status(200).json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const product = await productsService.getById(id);

  if (!product) {
    res.status(404).json({ message: "Producto no encontrado" });
    return;
  }

  res.status(200).json(product);
};