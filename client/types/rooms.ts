import { Mascot } from "./mascots";

// waiting: la gente entra con el código · live: votando · finished: hay resultado
export type RoomStatus = "waiting" | "live" | "finished";

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

export interface RoomState {
  code: string;
  // Quién creó la sala: solo esa persona ve el botón "Iniciar"
  artistId: number;
  status: RoomStatus;
  durationSeconds: number;
  secondsRemaining: number;
  endsAt: string | null;
  contenders: [RoomContender, RoomContender];
  totalVotes: number;
  winnerMascotId: number | null;
  isTie: boolean;
  recentVotes: RecentVote[];
}

// Lo que envía el formulario de crear votación
export interface CreateRoomData {
  mascotAId: number;
  mascotBId: number;
  durationSeconds: number;
}
