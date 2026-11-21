"use client";

import { useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import RankingRow from "@/components/RankingRow";
import { useMascots } from "@/context/MascotsContext";

export default function RankingPage() {
  const { ranking, loading, error, refreshMascots } = useMascots();

  // Al abrir el ranking se piden los números más recientes (por si hubo
  // votaciones desde la última vez). Se muestran los anteriores mientras llegan.
  useEffect(() => {
    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadRanking = async () => {
      await refreshMascots();
    };
    loadRanking();
  }, [refreshMascots]);

  if (loading) {
    return <LoadingState label="Cargando ranking" />;
  }

  if (error || !ranking) {
    return (
      <main className="mx-auto max-w-md px-4 pt-6">
        <EmptyState
          tone="error"
          title="Ranking no disponible"
          message={error ?? "No hay datos del ranking"}
        />
      </main>
    );
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

      {ranking.ranking.length === 0 ? (
        <EmptyState
          title="Aún no hay votos"
          message="El ranking aparece cuando se cierre la primera votación"
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {ranking.ranking.map((entry) => (
            <RankingRow key={entry.mascot.id} entry={entry} />
          ))}
        </ul>
      )}
    </main>
  );
}