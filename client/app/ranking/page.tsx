"use client";

import RankingRow from "@/components/RankingRow";
import { useMascots } from "@/context/MascotsContext";

export default function RankingPage() {
  const { ranking, loading, error } = useMascots();

  if (loading) {
    return <p className="p-6 text-arena-muted">Cargando ranking...</p>;
  }

  if (error || !ranking) {
    return <p className="p-6 text-corner-red">{error ?? "Sin datos"}</p>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-24 pt-6">
      <header className="rounded-2xl border border-arena-border bg-arena-surface p-4">
        <h1 className="text-xs tracking-widest text-neon-cyan">
          ARENA CLASH // TOP 5 MASCOT RANKINGS
        </h1>
        <p className="mt-2 text-xs text-arena-muted">TOTAL CLASH VOTES</p>
        <p className="text-2xl font-bold">
          {ranking.totalVotes.toLocaleString("en-US")} Votes
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {ranking.ranking.map((entry) => (
          <RankingRow key={entry.mascot.id} entry={entry} />
        ))}
      </ul>
    </main>
  );
}