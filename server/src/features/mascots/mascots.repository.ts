import { pool } from "../../db/pool";
import { Mascot, Ranking } from "./mascots.types";

const RANKING_SIZE = 5;

// Columnas comunes de una mascota, con los nombres que espera el frontend.
// El handle del artista sale del usuario dueño, no se guarda repetido.
const MASCOT_COLUMNS = `
  m.id,
  m.name,
  '@' || u.username AS "artistHandle",
  m.tagline,
  m.image_url AS "imageUrl"
`;

export const mascotsRepository = {
  findAll: async (): Promise<Mascot[]> => {
    const { rows } = await pool.query<Mascot>(
      `SELECT ${MASCOT_COLUMNS}, COUNT(v.id)::int AS "totalVotes"
       FROM mascots m
       JOIN users u ON u.id = m.artist_id
       LEFT JOIN votes v ON v.mascot_id = m.id
       GROUP BY m.id, u.username
       ORDER BY m.id`
    );
    return rows;
  },

  findById: async (id: number): Promise<Mascot | undefined> => {
    // $1 es un parámetro: pg lo envía aparte, así no hay inyección SQL
    const { rows } = await pool.query<Mascot>(
      `SELECT ${MASCOT_COLUMNS}, COUNT(v.id)::int AS "totalVotes"
       FROM mascots m
       JOIN users u ON u.id = m.artist_id
       LEFT JOIN votes v ON v.mascot_id = m.id
       WHERE m.id = $1
       GROUP BY m.id, u.username`,
      [id]
    );
    return rows[0];
  },

  // Una sola consulta con CTE: primero cuenta votos por mascota (vote_counts),
  // luego el total general (totals), y al final arma el top con puesto y porcentaje
  findRanking: async (): Promise<Ranking> => {
    const { rows } = await pool.query<
      Mascot & { rank: number; share: number; grandTotal: number }
    >(
      `WITH vote_counts AS (
         SELECT mascot_id, COUNT(*)::int AS votes
         FROM votes
         GROUP BY mascot_id
       ),
       totals AS (
         SELECT COALESCE(SUM(votes), 0)::int AS grand_total
         FROM vote_counts
       )
       SELECT ${MASCOT_COLUMNS},
              COALESCE(vc.votes, 0) AS "totalVotes",
              ROW_NUMBER() OVER (ORDER BY COALESCE(vc.votes, 0) DESC, m.id)::int AS rank,
              COALESCE(ROUND(vc.votes * 100.0 / NULLIF(t.grand_total, 0)), 0)::int AS share,
              t.grand_total AS "grandTotal"
       FROM mascots m
       JOIN users u ON u.id = m.artist_id
       LEFT JOIN vote_counts vc ON vc.mascot_id = m.id
       CROSS JOIN totals t
       ORDER BY rank
       LIMIT $1`,
      [RANKING_SIZE]
    );

    return {
      totalVotes: rows[0]?.grandTotal ?? 0,
      ranking: rows.map(({ rank, share, grandTotal: _total, ...mascot }) => ({
        rank,
        mascot,
        votes: mascot.totalVotes,
        share,
      })),
    };
  },
};
