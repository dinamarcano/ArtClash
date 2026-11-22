export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export type UserRole = "artist" | "user";

export interface Badge {
  id: number;
  name: string;
  rarity: BadgeRarity;
  xp: number;
  unlockedLabel: string;
}

export interface UserStatsRow {
  id: number;
  username: string;
  role: UserRole;
  title: string;
  verified: boolean;
  avatarUrl: string | null;
  votesCast: number;
  totalXp: number;
  mascotsFound: number;
}

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
