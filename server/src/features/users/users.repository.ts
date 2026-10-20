import { usersMock } from "./data.mock";
import { User, } from "./users.types";

export const usersRepository = {
  findAll: async (): Promise<User[]> => usersMock,
  findById: async (id: number): Promise<User | undefined> =>
    usersMock.find((user) => user.id === id),
};