import { Mascot } from "../mascots/mascots.types";

// waiting: la gente entra con el código · live: votando · finished: hay resultado
export type RoomStatus = "waiting" | "live" | "finished";

// Lo que devuelve la consulta con CTE: la sala + los votos de cada lado
export interface RoomRow {
  id: number;
  code: string;
  artistId: number;
  status: RoomStatus;
  durationSeconds: number;
  mascotAId: number;
  mascotBId: number;
  endsAt: Date | null;
  secondsRemaining: number;
  votesA: number;
  votesB: number;
}

export interface RoomContender {
  mascot: Mascot;
  votes: number;
  percentage: number;
}

export interface RecentVote {
  username: string;
  mascotName: string;
  xpAwarded: number;
  secondsAgo: number;
}

// Lo que recibe el frontend
export interface RoomState {
  code: string;
  // Quién creó la sala: solo esa persona ve el botón "Iniciar"
  artistId: number;
  status: RoomStatus;
  durationSeconds: number;
  secondsRemaining: number;
  endsAt: Date | null;
  contenders: [RoomContender, RoomContender];
  totalVotes: number;
  winnerMascotId: number | null;
  isTie: boolean;
  recentVotes: RecentVote[];
}

export interface CreateRoomInput {
  artistId: number;
  mascotAId: number;
  mascotBId: number;
  durationSeconds: number;
}
