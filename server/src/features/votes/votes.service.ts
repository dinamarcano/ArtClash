import { votesRepository } from "./votes.repository";
import { Vote } from "./votes.types";

export const votesService = {
  getByUser: async (userId: number): Promise<Vote[]> =>
    votesRepository.findByUser(userId),
};
