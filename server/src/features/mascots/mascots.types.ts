export interface Mascot {
  id: number;
  name: string;
  artistHandle: string;
  tagline: string;
  imageUrl: string;
  totalVotes: number;
}
export interface RankedMascot {
  rank: number;
  mascot: Mascot;
  votes: number;
  share: number;
}

export interface Ranking {
  totalVotes: number;
  ranking: RankedMascot[];
}