import { pool } from "../../db/pool";
import { Vote } from "./votes.types";

export const votesRepository = {
  findByUser: async (userId: number): Promise<Vote[]> => {
    const { rows } = await pool.query<Vote>(
      `SELECT v.id,
              v.user_id    AS "userId",
              v.mascot_id  AS "mascotId",
              r.code       AS "roomCode",
              v.xp_awarded AS "xpAwarded",
              v.created_at AS "createdAt"
       FROM votes v
       JOIN rooms r ON r.id = v.room_id
       WHERE v.user_id = $1
       ORDER BY v.created_at DESC`,
      [userId]
    );
    return rows;
  },
};
