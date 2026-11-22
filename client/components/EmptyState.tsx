import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: ReactNode;
  tone?: "default" | "error";
}

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
