export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: number;
  name: string;
  rarity: BadgeRarity;
  xp: number;
  unlockedLabel: string;
}

export interface User {
  id: number;
  username: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  arenaPts: number;
  mascotsFound: number;
  votesCast: number;
  verified: boolean;
  avatarUrl: string;
  badgesTotal: number;
  badges: Badge[];
}
