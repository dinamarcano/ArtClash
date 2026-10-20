import { mascotsMock } from "./data.mock";
import { Mascot } from "./mascots.types";

export const mascotsRepository = {
  findAll: async (): Promise<Mascot[]> => mascotsMock,
  findById: async (id: number): Promise<Mascot | undefined> =>
    mascotsMock.find((mascot) => mascot.id === id),
};