import { clientsRepository } from "./clients.repository";
import { Client } from "./clients.types";

export const clientsService = {
  getAll: async (): Promise<Client[]> => clientsRepository.findAll(),
  getById: async (id: number): Promise<Client | null> =>
    (await clientsRepository.findById(id)) ?? null,
};