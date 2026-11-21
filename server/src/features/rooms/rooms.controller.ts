import { Request, Response } from "express";
import { roomsService } from "./rooms.service";

const CODE_REGEX = /^\d{6}$/;
const MIN_DURATION = 60;
const MAX_DURATION = 120;

// Lee y valida el código de la URL; responde 400 si no sirve
const readCode = (req: Request, res: Response): string | null => {
  const code = String(req.params.code);
  if (!CODE_REGEX.test(code)) {
    res.status(400).json({ message: "El código debe tener 6 dígitos" });
    return null;
  }
  return code;
};

export const getRoomByCode = async (req: Request, res: Response) => {
  const code = readCode(req, res);
  if (!code) return;

  const room = await roomsService.getByCode(code, req.user!.id);
  if (!room) {
    res.status(404).json({ message: "Sala no encontrada" });
    return;
  }

  // El estado cambia cada segundo: que nadie lo guarde en caché
  res.set("Cache-Control", "no-store");
  res.status(200).json(room);
};

export const createRoom = async (req: Request, res: Response) => {
  const mascotAId = Number(req.body?.mascotAId);
  const mascotBId = Number(req.body?.mascotBId);
  const durationSeconds = Number(req.body?.durationSeconds);

  if (!Number.isInteger(mascotAId) || !Number.isInteger(mascotBId)) {
    res.status(400).json({ message: "Elige los dos artes que van a competir" });
    return;
  }
  if (mascotAId === mascotBId) {
    res.status(400).json({ message: "Un arte no puede competir contra sí mismo" });
    return;
  }
  if (
    !Number.isInteger(durationSeconds) ||
    durationSeconds < MIN_DURATION ||
    durationSeconds > MAX_DURATION
  ) {
    res.status(400).json({
      message: `La duración debe estar entre ${MIN_DURATION} y ${MAX_DURATION} segundos`,
    });
    return;
  }

  // El creador sale del token, no del cuerpo de la petición
  const room = await roomsService.create({
    artistId: req.user!.id,
    mascotAId,
    mascotBId,
    durationSeconds,
  });
  res.status(201).json(room);
};

export const startRoom = async (req: Request, res: Response) => {
  const code = readCode(req, res);
  if (!code) return;

  const room = await roomsService.start(code, req.user!.id);
  res.status(200).json(room);
};

export const voteInRoom = async (req: Request, res: Response) => {
  const code = readCode(req, res);
  if (!code) return;

  const mascotId = Number(req.body?.mascotId);
  if (!Number.isInteger(mascotId)) {
    res.status(400).json({ message: "Elige por cuál arte votar" });
    return;
  }

  // Quién vota sale del token: nadie puede votar a nombre de otro
  const room = await roomsService.vote(code, req.user!.id, mascotId);
  res.status(201).json(room);
};
