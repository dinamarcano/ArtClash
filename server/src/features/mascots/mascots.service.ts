import { HttpError } from "../../lib/httpError";
import { mascotsRepository } from "./mascots.repository";
import { CreateMascotInput, Mascot, Ranking } from "./mascots.types";

const PG_FOREIGN_KEY_VIOLATION = "23503";

export const mascotsService = {
  getAll: async (): Promise<Mascot[]> => mascotsRepository.findAll(),
  getByArtist: async (artistId: number): Promise<Mascot[]> =>
    mascotsRepository.findByArtist(artistId),
  getRanking: async (): Promise<Ranking> => mascotsRepository.findRanking(),

  create: async (input: CreateMascotInput): Promise<Mascot> =>
    mascotsRepository.create(input),

  remove: async (id: number, artistId: number): Promise<void> => {
    try {
      const deleted = await mascotsRepository.deleteOwned(id, artistId);
      if (deleted) return;
    } catch (error) {
      if ((error as { code?: string }).code === PG_FOREIGN_KEY_VIOLATION) {
        throw new HttpError(
          409,
          "Este arte ya participó en una votación y no se puede borrar"
        );
      }
      throw error;
    }

    const mascot = await mascotsRepository.findById(id);
    if (!mascot) throw new HttpError(404, "Mascot no encontrado");
    throw new HttpError(403, "Solo puedes borrar tu propio arte");
  },
};
