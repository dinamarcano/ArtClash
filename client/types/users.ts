export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: number;
  name: string;
  rarity: BadgeRarity;
  xp: number;
  unlockedLabel: string;
}

export type UserRole = "artist" | "user";

export interface User {
  id: number;
  username: string;
  role: UserRole;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  arenaPts: number;
  mascotsFound: number;
  votesCast: number;
  verified: boolean;
  avatarUrl: string | null;
  badgesTotal: number;
  badges: Badge[];
}
