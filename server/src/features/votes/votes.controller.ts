import { Request, Response } from "express";
import { votesService } from "./votes.service";

export const getMyVotes = async (req: Request, res: Response) => {
  const votes = await votesService.getByUser(req.user!.id);
  res.status(200).json(votes);
};
