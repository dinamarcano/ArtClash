import { config } from "../config";

export type RealtimeEvent = "room_started" | "vote_cast" | "room_finished";

export const roomChannel = (code: string) => `room:${code}`;

export const broadcast = async (
  channel: string,
  event: RealtimeEvent,
  payload: unknown
): Promise<void> => {
  try {
    const response = await fetch(`${config.supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        apikey: config.supabaseSecretKey,
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
