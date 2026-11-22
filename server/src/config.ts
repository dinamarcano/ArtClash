const REQUIRED = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
] as const;

const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length > 0) {
  throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
}

const read = (name: (typeof REQUIRED)[number]): string => process.env[name] as string;

export const config = {
  port: Number(process.env.PORT) || 3001,
  isVercel: Boolean(process.env.VERCEL),
  clientUrl: process.env.CLIENT_URL || "*",
  databaseUrl: read("DATABASE_URL"),
  jwtAccessSecret: read("JWT_ACCESS_SECRET"),
  supabaseUrl: read("SUPABASE_URL").replace(/\/$/, ""),
  supabaseSecretKey: read("SUPABASE_SECRET_KEY"),
};
