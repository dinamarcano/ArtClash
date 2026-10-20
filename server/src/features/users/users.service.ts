import { clientsRepository } from "./users.repository";
import { User } from "./users.types";

export const usersService = {
  getAll: async (): Promise<User[]> => clientsRepository.findAll(),
  getById: async (id: number): Promise<User | null> =>
    (await clientsRepository.findById(id)) ?? null,
};