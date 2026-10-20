import { User } from "./users.types";

export const usersMock: User[] = [
  {
    id: 1, username: "ArtHunter_99", title: "Mascot Hunter", level: 5,
    xp: 750, xpToNextLevel: 1000, arenaPts: 450, mascotsFound: 12, votesCast: 8,
    verified: true, avatarUrl: "https://placehold.co/200x200", badgesTotal: 12,
    badges: [
      { id: 1, name: "First Vote", rarity: "common", xp: 50, unlockedLabel: "OCT 22" },
      { id: 2, name: "Festival Explorer", rarity: "rare", xp: 120, unlockedLabel: "OCT 23" },
      { id: 3, name: "Mascot Master", rarity: "epic", xp: 250, unlockedLabel: "TODAY" },
      { id: 4, name: "Night Owl", rarity: "common", xp: 75, unlockedLabel: "02:14 AM" },
      { id: 5, name: "Streak x3", rarity: "legendary", xp: 300, unlockedLabel: "ACTIVE" },
    ],
  },
  { id: 2, username: "dev_12", title: "Rookie", level: 2, xp: 180, xpToNextLevel: 400, arenaPts: 90, mascotsFound: 3, votesCast: 4, verified: false, avatarUrl: "https://placehold.co/200x200", badgesTotal: 12, badges: [] },
  { id: 3, username: "cyber_sam", title: "Scout", level: 3, xp: 320, xpToNextLevel: 600, arenaPts: 150, mascotsFound: 5, votesCast: 6, verified: false, avatarUrl: "https://placehold.co/200x200", badgesTotal: 12, badges: [] },
  { id: 4, username: "neon_rider", title: "Scout", level: 3, xp: 410, xpToNextLevel: 600, arenaPts: 210, mascotsFound: 6, votesCast: 7, verified: true, avatarUrl: "https://placehold.co/200x200", badgesTotal: 12, badges: [] },
];