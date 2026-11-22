interface LoadingStateProps {
  label?: string;
  compact?: boolean;
}

export default function LoadingState({ label = "Cargando", compact = false }: LoadingStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-4 ${
        compact ? "min-h-32" : "min-h-[60vh]"
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-arena-border border-t-neon-cyan" />
      <p className="text-xs tracking-widest text-arena-muted">
        {label.toUpperCase()}...
      </p>
    </div>
  );
}
