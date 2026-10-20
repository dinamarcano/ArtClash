import { mascotsRepository } from "./mascots.repository";
import { Mascot } from "./mascots.types";
import { Ranking } from "./mascots.types";

export const mascotsService = {
  getAll: async (): Promise<Mascot[]> => mascotsRepository.findAll(),
  getById: async (id: number): Promise<Mascot | null> =>
    (await mascotsRepository.findById(id)) ?? null,

  getRanking: async (): Promise<Ranking> => {
  const mascots = await mascotsRepository.findAll();
  const totalVotes = mascots.reduce((sum, mascot) => sum + mascot.totalVotes, 0);

  const ranking = [...mascots]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 5)
    .map((mascot, index) => ({
      rank: index + 1,
      mascot,
      votes: mascot.totalVotes,
      share: totalVotes === 0 ? 0 : Math.round((mascot.totalVotes / totalVotes) * 100),
    }));

  return { totalVotes, ranking };
},
};

