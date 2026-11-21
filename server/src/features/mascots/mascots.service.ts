import { mascotsRepository } from "./mascots.repository";
import { Mascot, Ranking } from "./mascots.types";

export const mascotsService = {
  getAll: async (): Promise<Mascot[]> => mascotsRepository.findAll(),
  getById: async (id: number): Promise<Mascot | null> =>
    (await mascotsRepository.findById(id)) ?? null,
  // El cálculo del ranking lo hace la base con una CTE (ver repository)
  getRanking: async (): Promise<Ranking> => mascotsRepository.findRanking(),
};
