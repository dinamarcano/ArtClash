import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

// Un solo pool compartido por todos los repositories: reutiliza conexiones
// en vez de abrir una nueva por cada consulta
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase exige SSL
  ssl: { rejectUnauthorized: false },
  // Pocas conexiones: en Vercel cada función abre su propio pool
  max: 5,
});
