if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_SECRET_KEY");
}
const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/$/, "");
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export type RealtimeEvent = "room_started" | "vote_cast" | "room_finished";

export const roomChannel = (code: string) => `room:${code}`;

export const broadcast = async (
  channel: string,
  event: RealtimeEvent,
  payload: unknown
): Promise<void> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ topic: channel, event, payload, private: false }],
      }),
    });
    if (!response.ok) {
      console.error(`Broadcast ${event} falló:`, response.status, await response.text());
    }
  } catch (error) {
    console.error(`Broadcast ${event} falló:`, error);
  }
};
