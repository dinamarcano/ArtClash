import { votesMock } from "./data.mock";
import { Vote } from "./votes.types";

export const votesRepository = {
  findAll: async (): Promise<Vote[]> => votesMock,
  findById: async (id: number): Promise<Vote | undefined> =>
    votesMock.find((vote) => vote.id === id),
};