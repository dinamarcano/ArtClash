import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message?: string;
  // Botón o enlace opcional para que el usuario sepa qué hacer después
  action?: ReactNode;
  // "error" pinta el título en rojo para fallos de carga
  tone?: "default" | "error";
}

// Estado vacío reutilizable: listas sin datos o pantallas que no pudieron cargar
export default function EmptyState({
  title,
  message,
  action,
  tone = "default",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-arena-border p-6 text-center">
      <p
        className={`text-xs tracking-widest ${
          tone === "error" ? "text-corner-red" : "text-neon-cyan"
        }`}
      >
        {title.toUpperCase()}
      </p>
      {message && <p className="text-sm text-arena-muted">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
