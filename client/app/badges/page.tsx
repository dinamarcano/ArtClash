"use client";

import BadgeCard from "@/components/BadgeCard";
import { useUsers } from "@/context/UsersContext";

export default function BadgesPage() {
  const { currentUser, loading, error } = useUsers();

  if (loading) {
    return <p className="p-6 text-arena-muted">Cargando insignias...</p>;
  }

  if (error || !currentUser) {
    return <p className="p-6 text-corner-red">{error ?? "Sin datos"}</p>;
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