export interface Mascot {
  id: number;
  name: string;
  artistId: number;
  artistHandle: string;
  tagline: string;
  imageUrl: string;
  totalVotes: number;
}
export interface CreateMascotInput {
  artistId: number;
  name: string;
  imageUrl: string;
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