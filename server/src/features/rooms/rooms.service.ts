import crypto from "node:crypto";
import { HttpError } from "../../lib/httpError";
import { mascotsRepository } from "../mascots/mascots.repository";
import { roomsRepository } from "./rooms.repository";
import { CreateRoomInput, RoomRow, RoomState } from "./rooms.types";

const PG_UNIQUE_VIOLATION = "23505";
const PG_FOREIGN_KEY_VIOLATION = "23503";
const MAX_CODE_ATTEMPTS = 5;

// Código aleatorio de 6 dígitos (000000 a 999999)
const generateCode = (): string =>
  crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const percentage = (part: number, total: number): number =>
  total === 0 ? 50 : Math.round((part / total) * 100);

// Arma lo que ve el frontend a partir de la fila de la base
const buildState = async (row: RoomRow): Promise<RoomState> => {
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
  // El ganador solo se anuncia cuando la votación terminó
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
  };
};

export const roomsService = {
  getByCode: async (code: string): Promise<RoomState | null> => {
    // Si ya pasó la hora de cierre, se cierra antes de leer
    await roomsRepository.finishIfExpired(code);
    const row = await roomsRepository.findByCode(code);
    return row ? buildState(row) : null;
  },

  create: async (input: CreateRoomInput): Promise<RoomState> => {
    // Si el código aleatorio ya lo usa otra sala activa, la base lo rechaza
    // (índice único) y se prueba con otro
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateCode();
      try {
        await roomsRepository.create(input, code);
        const row = await roomsRepository.findByCode(code);
        return buildState(row!);
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
    if (started && row) return buildState(row);

    // No se inició: averiguamos por qué para dar un mensaje claro
    if (!row) throw new HttpError(404, "Sala no encontrada");
    if (row.artistId !== artistId) {
      throw new HttpError(403, "Solo quien creó la sala puede iniciarla");
    }
    throw new HttpError(
      409,
      row.status === "live" ? "La votación ya está en curso" : "La votación ya terminó"
    );
  },
};
