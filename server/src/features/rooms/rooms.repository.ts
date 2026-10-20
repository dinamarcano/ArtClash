import { roomsMock } from "./data.mock";
import { RoomDefinition } from "./rooms.types";

export const roomsRepository = {
  findByCode: async (code: string): Promise<RoomDefinition | undefined> =>
    roomsMock.find((room) => room.code === code),
};