import { HttpError } from "../../lib/httpError";
import { mascotsRepository } from "./mascots.repository";
import { CreateMascotInput, Mascot, Ranking } from "./mascots.types";

// Código de Postgres cuando una clave foránea impide borrar (ON DELETE RESTRICT)
const PG_FOREIGN_KEY_VIOLATION = "23503";

export const mascotsService = {
  getAll: async (): Promise<Mascot[]> => mascotsRepository.findAll(),
  getById: async (id: number): Promise<Mascot | null> =>
    (await mascotsRepository.findById(id)) ?? null,
  getByArtist: async (artistId: number): Promise<Mascot[]> =>
    mascotsRepository.findByArtist(artistId),
  // El cálculo del ranking lo hace la base con una CTE (ver repository)
  getRanking: async (): Promise<Ranking> => mascotsRepository.findRanking(),

  create: async (input: CreateMascotInput): Promise<Mascot> =>
    mascotsRepository.create(input),

  remove: async (id: number, artistId: number): Promise<void> => {
    try {
      const deleted = await mascotsRepository.deleteOwned(id, artistId);
      if (deleted) return;
    } catch (error) {
      // La base no deja borrar un arte que ya está en una votación
      if ((error as { code?: string }).code === PG_FOREIGN_KEY_VIOLATION) {
        throw new HttpError(
          409,
          "Este arte ya participó en una votación y no se puede borrar"
        );
      }
      throw error;
    }

    // No se borró: o no existe, o es de otro artista
    const mascot = await mascotsRepository.findById(id);
    if (!mascot) throw new HttpError(404, "Mascot no encontrado");
    throw new HttpError(403, "Solo puedes borrar tu propio arte");
  },
};
