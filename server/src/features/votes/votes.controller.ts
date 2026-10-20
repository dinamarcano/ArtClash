import { Request, Response } from "express";
import { votesService } from "./votes.service";

export const getVotes = async (_req: Request, res: Response) => {
  const votes = await votesService.getAll();
  res.status(200).json(votes);
};

export const getVoteById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "El id debe ser un número entero" });
    return;
  }

  const vote = await votesService.getById(id);

  if (!vote) {
    res.status(404).json({ message: "Voto no encontrado" });
    return;
  }

  res.status(200).json(vote);
};