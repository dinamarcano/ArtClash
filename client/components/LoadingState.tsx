// Estado de carga reutilizable: spinner neón + texto
export default function LoadingState({ label = "Cargando" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-arena-border border-t-neon-cyan" />
      <p className="text-xs tracking-widest text-arena-muted">
        {label.toUpperCase()}...
      </p>
    </div>
  );
}
