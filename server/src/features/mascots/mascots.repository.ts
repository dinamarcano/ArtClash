import { pool } from "../../db/pool";
import { CreateMascotInput, Mascot, RankedMascot, Ranking } from "./mascots.types";

const RANKING_SIZE = 5;

export const mascotJson = (m: string, u: string, totalVotes: string) => `json_build_object(
  'id', ${m}.id,
  'name', ${m}.name,
  'artistId', ${m}.artist_id,
  'artistHandle', '@' || ${u}.username,
  'tagline', ${m}.tagline,
  'imageUrl', ${m}.image_url,
  'totalVotes', ${totalVotes}
)`;

const MASCOT_COLUMNS = `
  m.id,
  m.name,
  m.artist_id AS "artistId",
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

  findByArtist: async (artistId: number): Promise<Mascot[]> => {
    const { rows } = await pool.query<Mascot>(
      `SELECT ${MASCOT_COLUMNS}, COUNT(v.id)::int AS "totalVotes"
       FROM mascots m
       JOIN users u ON u.id = m.artist_id
       LEFT JOIN votes v ON v.mascot_id = m.id
       WHERE m.artist_id = $1
       GROUP BY m.id, u.username
       ORDER BY m.created_at DESC`,
      [artistId]
    );
    return rows;
  },

  create: async (input: CreateMascotInput): Promise<Mascot> => {
    const { rows } = await pool.query<Mascot>(
      `WITH inserted AS (
         INSERT INTO mascots (artist_id, name, image_url)
         VALUES ($1, $2, $3)
         RETURNING *
       )
       SELECT ${MASCOT_COLUMNS}, 0 AS "totalVotes"
       FROM inserted m
       JOIN users u ON u.id = m.artist_id`,
      [input.artistId, input.name, input.imageUrl]
    );
    return rows[0];
  },

  deleteOwned: async (id: number, artistId: number): Promise<boolean> => {
    const { rowCount } = await pool.query(
      `DELETE FROM mascots WHERE id = $1 AND artist_id = $2`,
      [id, artistId]
    );
    return (rowCount ?? 0) > 0;
  },

  findRanking: async (): Promise<Ranking> => {
    const { rows } = await pool.query<RankedMascot & { grandTotal: number }>(
      `WITH vote_counts AS (
         SELECT mascot_id, COUNT(*)::int AS votes
         FROM votes
         GROUP BY mascot_id
       ),
       totals AS (
         SELECT COALESCE(SUM(votes), 0)::int AS grand_total
         FROM vote_counts
       )
       SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(vc.votes, 0) DESC, m.id)::int AS rank,
              ${mascotJson("m", "u", "COALESCE(vc.votes, 0)")} AS mascot,
              COALESCE(vc.votes, 0) AS votes,
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
      ranking: rows.map(({ grandTotal: _total, ...entry }) => entry),
    };
  },
};
