import { Mascot } from "../mascots/mascots.types";

export type RoomStatus = "waiting" | "live" | "finished";

export interface RoomRow {
  id: number;
  code: string;
  artistId: number;
  status: RoomStatus;
  durationSeconds: number;
  endsAt: Date | null;
  secondsRemaining: number;
  votesA: number;
  votesB: number;
  mascotA: Mascot;
  mascotB: Mascot;
  recentVotes: RecentVote[];
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

export interface RoomState {
  code: string;
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
  myVoteMascotId: number | null;
}

export interface CreateRoomInput {
  artistId: number;
  mascotAId: number;
  mascotBId: number;
  durationSeconds: number;
}
