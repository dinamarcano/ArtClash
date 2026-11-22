import { pool } from "../../db/pool";
import { CreateRoomInput, RecentVote, RoomRow } from "./rooms.types";

const RECENT_VOTES_LIMIT = 6;

export const roomsRepository = {
  create: async (input: CreateRoomInput, code: string): Promise<void> => {
    await pool.query(
      `INSERT INTO rooms (code, artist_id, mascot_a_id, mascot_b_id, duration_seconds)
       VALUES ($1, $2, $3, $4, $5)`,
      [code, input.artistId, input.mascotAId, input.mascotBId, input.durationSeconds]
    );
  },

  findByCode: async (code: string): Promise<RoomRow | undefined> => {
    const { rows } = await pool.query<RoomRow>(
      `WITH room AS (
         SELECT *
         FROM rooms
         WHERE code = $1
         ORDER BY (status <> 'finished') DESC, created_at DESC
         LIMIT 1
       ),
       counts AS (
         SELECT v.mascot_id, COUNT(*)::int AS votes
         FROM votes v
         JOIN room r ON r.id = v.room_id
         GROUP BY v.mascot_id
       )
       SELECT r.id,
              r.code,
              r.artist_id         AS "artistId",
              r.status,
              r.duration_seconds  AS "durationSeconds",
              r.mascot_a_id       AS "mascotAId",
              r.mascot_b_id       AS "mascotBId",
              r.ends_at           AS "endsAt",
              CASE r.status
                WHEN 'waiting' THEN r.duration_seconds
                WHEN 'live' THEN GREATEST(0, CEIL(EXTRACT(EPOCH FROM (r.ends_at - now()))))::int
                ELSE 0
              END                 AS "secondsRemaining",
              COALESCE(ca.votes, 0) AS "votesA",
              COALESCE(cb.votes, 0) AS "votesB"
       FROM room r
       LEFT JOIN counts ca ON ca.mascot_id = r.mascot_a_id
       LEFT JOIN counts cb ON cb.mascot_id = r.mascot_b_id`,
      [code]
    );
    return rows[0];
  },

  findRecentVotes: async (roomId: number): Promise<RecentVote[]> => {
    const { rows } = await pool.query<RecentVote>(
      `SELECT u.username,
              m.name        AS "mascotName",
              v.xp_awarded  AS "xpAwarded",
              FLOOR(EXTRACT(EPOCH FROM (now() - v.created_at)))::int AS "secondsAgo"
       FROM votes v
       JOIN users u   ON u.id = v.user_id
       JOIN mascots m ON m.id = v.mascot_id
       WHERE v.room_id = $1
       ORDER BY v.created_at DESC
       LIMIT $2`,
      [roomId, RECENT_VOTES_LIMIT]
    );
    return rows;
  },

  insertVote: async (code: string, userId: number, mascotId: number): Promise<boolean> => {
    const { rowCount } = await pool.query(
      `INSERT INTO votes (room_id, user_id, mascot_id)
       SELECT r.id, $2, $3
       FROM rooms r
       WHERE r.code = $1
         AND r.status = 'live'
         AND r.ends_at > now()
         AND $3 IN (r.mascot_a_id, r.mascot_b_id)`,
      [code, userId, mascotId]
    );
    return (rowCount ?? 0) > 0;
  },

  findUserVote: async (roomId: number, userId: number): Promise<number | null> => {
    const { rows } = await pool.query<{ mascotId: number }>(
      `SELECT mascot_id AS "mascotId" FROM votes WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
    return rows[0]?.mascotId ?? null;
  },

  start: async (code: string, artistId: number): Promise<boolean> => {
    const { rowCount } = await pool.query(
      `UPDATE rooms
       SET status = 'live',
           started_at = now(),
           ends_at = now() + make_interval(secs => duration_seconds)
       WHERE code = $1 AND status = 'waiting' AND artist_id = $2`,
      [code, artistId]
    );
    return (rowCount ?? 0) > 0;
  },

  finishIfExpired: async (code: string): Promise<boolean> => {
    const { rowCount } = await pool.query(
      `UPDATE rooms
       SET status = 'finished'
       WHERE code = $1 AND status = 'live' AND ends_at <= now()`,
      [code]
    );
    return (rowCount ?? 0) > 0;
  },
};
