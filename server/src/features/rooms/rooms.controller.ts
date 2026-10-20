import { Request, Response } from "express";
import { roomsService } from "./rooms.service";

export const getRoomByCode = async (req: Request, res: Response) => {
  const code = String(req.params.code);

  if (!/^\d{6}$/.test(code)) {
    res.status(400).json({ message: "El código debe tener 6 dígitos" });
    return;
  }

  const room = await roomsService.getByCode(code);

  if (!room) {
    res.status(404).json({ message: "Sala no encontrada" });
    return;
  }

  res.set("Cache-Control", "no-store");
  res.status(200).json(room);
};