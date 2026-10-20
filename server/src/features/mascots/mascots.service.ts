import { mascotsRepository } from "./mascots.repository";
import { Mascot } from "./mascots.types";

export const mascotsService = {
  getAll: async (): Promise<Mascot[]> => mascotsRepository.findAll(),
  getById: async (id: number): Promise<Mascot | null> =>
    (await mascotsRepository.findById(id)) ?? null,
};