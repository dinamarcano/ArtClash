import { Request, Response } from "express";
import { clientsService } from "./clients.service";

export const getClients = async (_req: Request, res: Response) => {
  const clients = await clientsService.getAll();
  res.status(200).json(clients);
};

export const getClientById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const client = await clientsService.getById(id);

  if (!client) {
    res.status(404).json({ message: "Cliente no encontrado" });
    return;
  }

  res.status(200).json(client);
};