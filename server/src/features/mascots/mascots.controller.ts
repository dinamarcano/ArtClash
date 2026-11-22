import { Request, Response } from "express";
import { mascotsService } from "./mascots.service";

const MAX_NAME_LENGTH = 40;
const MAX_URL_LENGTH = 500;

const isValidImageUrl = (value: string): boolean => {
  if (value.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const getMascots = async (_req: Request, res: Response) => {
  const mascots = await mascotsService.getAll();
  res.status(200).json(mascots);
};

export const getMyMascots = async (req: Request, res: Response) => {
  const mascots = await mascotsService.getByArtist(req.user!.id);
  res.status(200).json(mascots);
};

export const getMascotsRanking = async (_req: Request, res: Response) => {
  const ranking = await mascotsService.getRanking();
  res.status(200).json(ranking);
};

export const createMascot = async (req: Request, res: Response) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const imageUrl =
    typeof req.body?.imageUrl === "string" ? req.body.imageUrl.trim() : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    res.status(400).json({
      message: `El nombre es obligatorio y de máximo ${MAX_NAME_LENGTH} caracteres`,
    });
    return;
  }
  if (!isValidImageUrl(imageUrl)) {
    res.status(400).json({
      message: "La imagen debe ser una URL válida que empiece por http:// o https://",
    });
    return;
  }

  const mascot = await mascotsService.create({
    artistId: req.user!.id,
    name,
    imageUrl,
  });
  res.status(201).json(mascot);
};

export const deleteMascot = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  await mascotsService.remove(id, req.user!.id);
  res.status(204).end();
};
