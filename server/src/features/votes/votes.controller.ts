import { Request, Response } from "express";
import { votesService } from "./votes.service";

// Historial de votos de quien tiene la sesión (el usuario sale del token)
export const getMyVotes = async (req: Request, res: Response) => {
  const votes = await votesService.getByUser(req.user!.id);
  res.status(200).json(votes);
};
