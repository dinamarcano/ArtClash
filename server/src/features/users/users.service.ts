import { usersRepository } from "./users.repository";
import { Badge, User, UserStatsRow } from "./users.types";

const XP_PER_LEVEL = 200;
const BADGES_TOTAL = 12;

const toUser = (row: UserStatsRow, badges: Badge[]): User => ({
  id: row.id,
  username: row.username,
  role: row.role,
  title: row.title,
  level: Math.floor(row.totalXp / XP_PER_LEVEL) + 1,
  xp: row.totalXp % XP_PER_LEVEL,
  xpToNextLevel: XP_PER_LEVEL,
  arenaPts: row.totalXp,
  mascotsFound: row.mascotsFound,
  votesCast: row.votesCast,
  verified: row.verified,
  avatarUrl: row.avatarUrl,
  badgesTotal: BADGES_TOTAL,
  badges,
});

export const usersService = {
  getById: async (id: number): Promise<User | null> => {
    const [row, badges] = await Promise.all([
      usersRepository.findById(id),
      usersRepository.findBadges(),
    ]);
    return row ? toUser(row, badges) : null;
  },
};
