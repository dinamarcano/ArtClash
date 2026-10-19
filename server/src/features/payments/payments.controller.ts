import { Request, Response } from "express";
import { paymentsService } from "./payments.service";

export const getPayments = async (_req: Request, res: Response) => {
  const payments = await paymentsService.getAll();
  res.status(200).json(payments);
};

export const getPaymentById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const payment = await paymentsService.getById(id);

  if (!payment) {
    res.status(404).json({ message: "Pago no encontrado" });
    return;
  }

  res.status(200).json(payment);
};