// Emite eventos en vivo con Supabase Realtime (Broadcast).
//
// El servidor está en Vercel, que no mantiene conexiones abiertas; por eso
// el backend ENVÍA cada evento con una petición HTTP a la API de Broadcast,
// y Supabase se lo reenvía por WebSocket a todos los clientes suscritos
// a ese canal.

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_SECRET_KEY");
}
const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/$/, "");
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

// Nombres de los eventos: el frontend escucha exactamente estos
export type RealtimeEvent = "room_started" | "vote_cast" | "room_finished";

// Un canal por sala: cada cliente solo recibe los eventos de su sala
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
    // Si falla el aviso en vivo, el voto ya quedó guardado: no se pierde nada,
    // los clientes lo verán en la siguiente actualización
    console.error(`Broadcast ${event} falló:`, error);
  }
};
