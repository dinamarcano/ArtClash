import { usersRepository } from "./users.repository";
import { Badge, User, UserStatsRow } from "./users.types";

// Reglas del juego: cada voto da 50 XP, así que se sube de nivel cada 4 votos
const XP_PER_LEVEL = 200;
// Total de insignias que muestra la pantalla (las que faltan salen "LOCKED")
const BADGES_TOTAL = 12;

const toUser = (row: UserStatsRow, badges: Badge[]): User => ({
  id: row.id,
  username: row.username,
  role: row.role,
  title: row.title,
  level: Math.floor(row.totalXp / XP_PER_LEVEL) + 1,
  // XP dentro del nivel actual, para la barra de progreso
  xp: row.totalXp % XP_PER_LEVEL,
  xpToNextLevel: XP_PER_LEVEL,
  // Puntos de arena = toda la XP acumulada
  arenaPts: row.totalXp,
  mascotsFound: row.mascotsFound,
  votesCast: row.votesCast,
  verified: row.verified,
  avatarUrl: row.avatarUrl,
  badgesTotal: BADGES_TOTAL,
  badges,
});

// Lo usa GET /auth/me para armar el perfil de quien tiene la sesión
export const usersService = {
  getById: async (id: number): Promise<User | null> => {
    const [row, badges] = await Promise.all([
      usersRepository.findById(id),
      usersRepository.findBadges(),
    ]);
    return row ? toUser(row, badges) : null;
  },
};
