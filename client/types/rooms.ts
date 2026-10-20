import { Mascot } from "./mascots";

export type RoomStatus = "live" | "finished";

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
  round: number;
  status: RoomStatus;
  secondsRemaining: number;
  durationSeconds: number;
  contenders: [RoomContender, RoomContender];
  totalVotes: number;
  winnerMascotId: number | null;
  isTie: boolean;
  recentVotes: RecentVote[];
}