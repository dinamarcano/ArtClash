import { Vote } from "./votes.types";

export const votesMock: Vote[] = [
  { id: 1, userId: 1, mascotId: 1, roomCode: "482910", xpAwarded: 50, createdAt: "2026-10-20T14:20:00Z" },
  { id: 2, userId: 1, mascotId: 2, roomCode: "482911", xpAwarded: 50, createdAt: "2026-10-19T19:45:00Z" },
  { id: 3, userId: 1, mascotId: 3, roomCode: "482912", xpAwarded: 50, createdAt: "2026-10-18T11:10:00Z" },
  { id: 4, userId: 2, mascotId: 1, roomCode: "482910", xpAwarded: 50, createdAt: "2026-10-20T14:21:00Z" },
  { id: 5, userId: 3, mascotId: 2, roomCode: "482910", xpAwarded: 50, createdAt: "2026-10-20T14:22:00Z" },
  { id: 6, userId: 4, mascotId: 2, roomCode: "482910", xpAwarded: 50, createdAt: "2026-10-20T14:23:00Z" },
];