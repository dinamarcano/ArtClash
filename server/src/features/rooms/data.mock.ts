import { RoomDefinition } from "./rooms.types";

export const roomsMock: RoomDefinition[] = [
  {
    code: "482910",
    mascotAId: 1,
    mascotBId: 2,
    voteDurationSeconds: 90,
    resultDurationSeconds: 30,
    epochMs: new Date("2026-10-20T00:00:00Z").getTime(),
  },
  {
    code: "482911",
    mascotAId: 3,
    mascotBId: 4,
    voteDurationSeconds: 60,
    resultDurationSeconds: 20,
    epochMs: new Date("2026-10-20T00:00:37Z").getTime(),
  },
];