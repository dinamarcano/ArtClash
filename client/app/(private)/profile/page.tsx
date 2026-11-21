"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BadgeCard from "@/components/BadgeCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { useMascots } from "@/context/MascotsContext";
import { useVotes } from "@/context/VotesContext";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { mascots, loading: mascotsLoading } = useMascots();
  const { votes, loading: votesLoading, reloadVotes } = useVotes();
  const [loggingOut, setLoggingOut] = useState(false);

  // Al entrar al perfil, trae la XP y el historial de votos más recientes
  useEffect(() => {
    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadProfile = async () => {
      await Promise.all([refreshUser(), reloadVotes()]);
    };
    loadProfile();
  }, [refreshUser, reloadVotes]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  // PrivateRoute garantiza que hay usuario; esto solo satisface a TypeScript
  if (!user) return null;
  const currentUser = user;

  const progress = Math.round((currentUser.xp / currentUser.xpToNextLevel) * 100);

  // El servidor ya devuelve solo mis votos; aquí se les une la info del arte
  const supported = votes.flatMap((vote) => {
    const mascot = mascots.find((item) => item.id === vote.mascotId);
    return mascot ? [{ vote, mascot }] : [];
  });
  // Mientras carga el historial no se muestra "Aún no has votado"
  const historyLoading = votesLoading || mascotsLoading;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-24 pt-6">
      <section className="rounded-2xl border border-arena-border bg-arena-surface p-4">
        <div className="flex items-center gap-3">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.username}
              className="h-16 w-16 rounded-full border-2 border-neon-cyan object-cover"
            />
          ) : (
            // Usuarios sin foto: mostramos su inicial
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-cyan text-2xl font-bold text-neon-cyan">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold">
              {currentUser.username}
              {currentUser.verified && <span className="ml-1 text-neon-cyan">✓</span>}
            </h1>
            <p className="text-xs text-arena-muted">
              Lvl {currentUser.level} {currentUser.title}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] tracking-widest text-arena-muted">
            <span>SYNC LEVEL PROGRESS</span>
            <span>
              {currentUser.xp} / {currentUser.xpToNextLevel} XP
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-arena-border">
            <div className="h-full bg-neon-pink" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatCard label="ARENA PTS" value={currentUser.arenaPts} />
          <StatCard label="MASCOTS FOUND" value={currentUser.mascotsFound} />
          <StatCard label="VOTES CAST" value={currentUser.votesCast} />
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs tracking-widest text-neon-pink">
            UNLOCKED BADGES {currentUser.badges.length}/{currentUser.badgesTotal}
          </h2>
          <Link href="/badges" className="text-xs text-neon-cyan">
            VIEW ALL
          </Link>
        </div>
        {currentUser.badges.length === 0 ? (
          <EmptyState
            title="Sin insignias aún"
            message="Vota en las salas para desbloquear tu primera insignia"
          />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {currentUser.badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xs tracking-widest text-neon-cyan">SUPPORTED ARTISTS</h2>
        <p className="mb-2 text-xs text-arena-muted">Live Voting Registry</p>
        {historyLoading ? (
          <LoadingState label="Cargando tus votos" compact />
        ) : supported.length === 0 ? (
          <EmptyState
            title="Aún no has votado"
            message="Entra a una sala con su código y apoya a tu artista favorito"
            action={
              <Link
                href="/"
                className="rounded-xl bg-neon-pink px-4 py-2 text-xs font-bold tracking-widest text-black"
              >
                ENTRAR A UNA SALA
              </Link>
            }
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {supported.map(({ vote, mascot }) => (
              <li
                key={vote.id}
                className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-surface p-3"
              >
                <img
                  src={mascot.imageUrl}
                  alt={mascot.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">
                    {mascot.artistHandle}{" "}
                    <span className="text-xs font-normal text-neon-cyan">Voted</span>
                  </p>
                  <p className="text-xs text-arena-muted">{mascot.name}</p>
                </div>
                <span className="text-xs text-arena-muted">
                  {new Date(vote.createdAt).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex items-center justify-center gap-2 rounded-xl border border-corner-red py-3 text-xs font-bold tracking-widest text-corner-red transition disabled:opacity-60"
      >
        {loggingOut && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-corner-red/30 border-t-corner-red" />
        )}
        {loggingOut ? "CERRANDO SESIÓN..." : "CERRAR SESIÓN"}
      </button>
    </main>
  );
}