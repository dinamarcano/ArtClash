import { createClient } from "@supabase/supabase-js";

// Cliente de Supabase SOLO para escuchar eventos en vivo (Realtime).
// Los datos, el login y los votos siguen pasando por nuestra API.
// Usa la clave "publishable": es pública y solo sirve para escuchar;
// la clave secreta vive únicamente en el servidor.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en el .env del cliente"
  );
}

export const supabase = createClient(url, publishableKey, {
  // No usamos el login de Supabase (tenemos el nuestro): nada que guardar
  auth: { persistSession: false, autoRefreshToken: false },
});

// Mismos nombres que usa el backend al emitir
export const roomChannel = (code: string) => `room:${code}`;
export const ROOM_EVENTS = ["room_started", "vote_cast", "room_finished"] as const;
