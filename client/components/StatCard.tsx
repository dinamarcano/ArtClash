export default function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-arena-border bg-arena-bg p-3 text-center">
      <p className="text-xl font-bold text-neon-cyan">{value}</p>
      <p className="text-[10px] tracking-widest text-arena-muted">{label}</p>
    </div>
  );
}