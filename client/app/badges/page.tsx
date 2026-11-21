"use client";

import BadgeCard from "@/components/BadgeCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { useUsers } from "@/context/UsersContext";

export default function BadgesPage() {
  const { currentUser, loading, error } = useUsers();

  if (loading) {
    return <LoadingState label="Cargando insignias" />;
  }

  if (error || !currentUser) {
    return (
      <main className="mx-auto max-w-md px-4 pt-6">
        <EmptyState
          tone="error"
          title="Insignias no disponibles"
          message={error ?? "No hay datos del usuario"}
        />
      </main>
    );
  }

  const lockedCount = currentUser.badgesTotal - currentUser.badges.length;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-24 pt-6">
      <h1 className="text-xs tracking-widest text-neon-pink">
        BADGES {currentUser.badges.length}/{currentUser.badgesTotal}
      </h1>
      <div className="grid grid-cols-2 gap-3">
        {currentUser.badges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
        {Array.from({ length: lockedCount }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-24 items-center justify-center rounded-xl border border-dashed border-arena-border text-xs tracking-widest text-arena-muted"
          >
            LOCKED
          </div>
        ))}
      </div>
    </main>
  );
}