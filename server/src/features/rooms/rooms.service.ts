import crypto from "node:crypto";
import { HttpError } from "../../lib/httpError";
import { broadcast, roomChannel } from "../../lib/realtime";
import { mascotsRepository } from "../mascots/mascots.repository";
import { roomsRepository } from "./rooms.repository";
import { CreateRoomInput, RoomRow, RoomState } from "./rooms.types";

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const MAX_CODE_ATTEMPTS = 5;

const generateCode = (): string =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const percentage = (part: number, total: number): number =>
  total === 0 ? 50 : Math.round((part / total) * 100);

const buildState = async (
  row: RoomRow,
  myVoteMascotId: number | null
): Promise<RoomState> => {
  const [mascotA, mascotB, recentVotes] = await Promise.all([
    mascotsRepository.findById(row.mascotAId),
    mascotsRepository.findById(row.mascotBId),
    roomsRepository.findRecentVotes(row.id),
  ]);
  if (!mascotA || !mascotB) {
    throw new HttpError(500, "La sala apunta a un arte que no existe");
  }

  const totalVotes = row.votesA + row.votesB;
  const percentA = percentage(row.votesA, totalVotes);
  const finished = row.status === "finished";
  const isTie = finished && row.votesA === row.votesB;
  const winnerMascotId =
    !finished || isTie ? null : row.votesA > row.votesB ? mascotA.id : mascotB.id;

  return {
    code: row.code,
    artistId: row.artistId,
    status: row.status,
    durationSeconds: row.durationSeconds,
    secondsRemaining: row.secondsRemaining,
    endsAt: row.endsAt,
    contenders: [
      { mascot: mascotA, votes: row.votesA, percentage: percentA },
      { mascot: mascotB, votes: row.votesB, percentage: 100 - percentA },
    ],
    totalVotes,
    winnerMascotId,
    isTie,
    recentVotes,
    myVoteMascotId,
  };
};

const closeIfExpired = async (code: string): Promise<void> => {
  const closed = await roomsRepository.finishIfExpired(code);
  if (!closed) return;
  const row = await roomsRepository.findByCode(code);
  if (row) {
    await broadcast(roomChannel(code), "room_finished", await buildState(row, null));
  }
};

export const roomsService = {
  getByCode: async (code: string, userId: number): Promise<RoomState | null> => {
    await closeIfExpired(code);
    const row = await roomsRepository.findByCode(code);
    if (!row) return null;
    const myVote = await roomsRepository.findUserVote(row.id, userId);
    return buildState(row, myVote);
  },

  create: async (input: CreateRoomInput): Promise<RoomState> => {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateCode();
      try {
        await roomsRepository.create(input, code);
        const row = await roomsRepository.findByCode(code);
        return buildState(row!, null);
      } catch (error) {
        const pgCode = (error as { code?: string }).code;
        if (pgCode === PG_UNIQUE_VIOLATION) continue;
        if (pgCode === PG_FOREIGN_KEY_VIOLATION) {
          throw new HttpError(400, "Uno de los artes elegidos no existe");
        }
        throw error;
      }
    }
    throw new HttpError(503, "No se pudo generar un código libre, intenta de nuevo");
  },

  start: async (code: string, artistId: number): Promise<RoomState> => {
    const started = await roomsRepository.start(code, artistId);
    const row = await roomsRepository.findByCode(code);
    if (started && row) {
      const state = await buildState(row, null);
      await broadcast(roomChannel(code), "room_started", state);
      return state;
    }

    if (!row) throw new HttpError(404, "Sala no encontrada");
    if (row.artistId !== artistId) {
      throw new HttpError(403, "Solo quien creó la sala puede iniciarla");
    }
    throw new HttpError(
      409,
      row.status === "live" ? "La votación ya está en curso" : "La votación ya terminó"
    );
  },

  vote: async (code: string, userId: number, mascotId: number): Promise<RoomState> => {
    await closeIfExpired(code);

    let inserted: boolean;
    try {
      inserted = await roomsRepository.insertVote(code, userId, mascotId);
    } catch (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        throw new HttpError(409, "Ya votaste en esta sala");
      }
      throw error;
    }

    const row = await roomsRepository.findByCode(code);
    if (!row) throw new HttpError(404, "Sala no encontrada");

    if (!inserted) {
      if (row.status === "waiting") {
        throw new HttpError(409, "La votación aún no ha empezado");
      }
      if (row.status === "finished" || row.secondsRemaining === 0) {
        throw new HttpError(409, "La votación ya terminó");
      }
      throw new HttpError(400, "Ese arte no compite en esta sala");
    }

    const state = await buildState(row, null);
    await broadcast(roomChannel(code), "vote_cast", state);
    return { ...state, myVoteMascotId: mascotId };
  },
};
