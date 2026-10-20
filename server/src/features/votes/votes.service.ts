import { votesRepository } from "./votes.repository";
import { Vote } from "./votes.types";

export const votesService = {
  getAll: async (): Promise<Vote[]> => votesRepository.findAll(),
  getById: async (id: number): Promise<Vote | null> =>
    (await votesRepository.findById(id)) ?? null,
};