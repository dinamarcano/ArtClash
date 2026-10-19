import { clientsMock } from "./data.mock";
import { Client } from "./clients.types";

export const clientsRepository = {
  findAll: async (): Promise<Client[]> => clientsMock,
  findById: async (id: number): Promise<Client | undefined> =>
    clientsMock.find((client) => client.id === id),
};