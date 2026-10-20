import { Request, Response } from "express";
import { mascotsService } from "./mascots.service";

export const getMascots = async (_req: Request, res: Response) => {
  const mascots = await mascotsService.getAll();
  res.status(200).json(mascots);
};

export const getMascotById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const mascot = await mascotsService.getById(id);

  if (!mascot) {
    res.status(404).json({ message: "Mascot no encontrado" });
    return;
  }

  res.status(200).json(mascot);
};

export const getMascotsRanking = async (_req: Request, res: Response) => {
  const ranking = await mascotsService.getRanking();
  res.status(200).json(ranking);
};