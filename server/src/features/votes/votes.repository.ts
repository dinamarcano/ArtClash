import { pool } from "../../db/pool";
import { Vote } from "./votes.types";

// El código de sala sale de la tabla rooms; el voto guarda solo el id de la sala
const VOTE_COLUMNS = `
  v.id,
  v.user_id    AS "userId",
  v.mascot_id  AS "mascotId",
  r.code       AS "roomCode",
  v.xp_awarded AS "xpAwarded",
  v.created_at AS "createdAt"
`;

export const votesRepository = {
  findAll: async (): Promise<Vote[]> => {
    const { rows } = await pool.query<Vote>(
      `SELECT ${VOTE_COLUMNS}
       FROM votes v
       JOIN rooms r ON r.id = v.room_id
       ORDER BY v.created_at DESC`
    );
    return rows;
  },

  findById: async (id: number): Promise<Vote | undefined> => {
    const { rows } = await pool.query<Vote>(
      `SELECT ${VOTE_COLUMNS}
       FROM votes v
       JOIN rooms r ON r.id = v.room_id
       WHERE v.id = $1`,
      [id]
    );
    return rows[0];
  },
};
