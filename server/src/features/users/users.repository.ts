import { pool } from "../../db/pool";
import { Badge, UserStatsRow } from "./users.types";

// CTE: primero resume los votos de cada usuario (user_stats) y luego lo une
// con la tabla de usuarios. Nunca se seleccionan email ni password_hash.
const USERS_WITH_STATS = `
  WITH user_stats AS (
    SELECT user_id,
           COUNT(*)::int                      AS votes_cast,
           COALESCE(SUM(xp_awarded), 0)::int  AS total_xp,
           COUNT(DISTINCT mascot_id)::int     AS mascots_found
    FROM votes
    GROUP BY user_id
  )
  SELECT u.id,
         u.username,
         u.role,
         u.title,
         u.verified,
         u.avatar_url                    AS "avatarUrl",
         COALESCE(s.votes_cast, 0)       AS "votesCast",
         COALESCE(s.total_xp, 0)         AS "totalXp",
         COALESCE(s.mascots_found, 0)    AS "mascotsFound"
  FROM users u
  LEFT JOIN user_stats s ON s.user_id = u.id
`;

export const usersRepository = {
  findAll: async (): Promise<UserStatsRow[]> => {
    const { rows } = await pool.query<UserStatsRow>(
      `${USERS_WITH_STATS} ORDER BY u.id`
    );
    return rows;
  },

  findById: async (id: number): Promise<UserStatsRow | undefined> => {
    const { rows } = await pool.query<UserStatsRow>(
      `${USERS_WITH_STATS} WHERE u.id = $1`,
      [id]
    );
    return rows[0];
  },

  // Catálogo de insignias (simulado: igual para todos)
  findBadges: async (): Promise<Badge[]> => {
    const { rows } = await pool.query<Badge>(
      `SELECT id, name, rarity, xp, unlocked_label AS "unlockedLabel"
       FROM badges
       ORDER BY id`
    );
    return rows;
  },
};
