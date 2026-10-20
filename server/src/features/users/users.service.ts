import { usersRepository } from "./users.repository";
import { User } from "./users.types";

export const usersService = {
  getAll: async (): Promise<User[]> => usersRepository.findAll(),
  getById: async (id: number): Promise<User | null> =>
    (await usersRepository.findById(id)) ?? null,
};