import { Mascot } from "./mascots";

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
  myVoteMascotId: number | null;
}

export interface CreateRoomData {
  mascotAId: number;
  mascotBId: number;
  durationSeconds: number;
}
