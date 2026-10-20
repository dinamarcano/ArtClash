"use client";

import Link from "next/link";
import BadgeCard from "@/components/BadgeCard";
import StatCard from "@/components/StatCard";
import { useMascots } from "@/context/MascotsContext";
import { useUsers } from "@/context/UsersContext";
import { useVotes } from "@/context/VotesContext";

export default function ProfilePage() {
  const { currentUser, loading, error } = useUsers();
  const { mascots } = useMascots();
  const { votes } = useVotes();

  if (loading) {
    return <p className="p-6 text-arena-muted">Cargando perfil...</p>;
  }

  if (error || !currentUser) {
    return <p className="p-6 text-corner-red">{error ?? "Sin datos"}</p>;
  }

  const progress = Math.round((currentUser.xp / currentUser.xpToNextLevel) * 100);

  const supported = votes
    .filter((vote) => vote.userId === currentUser.id)
    .flatMap((vote) => {
      const mascot = mascots.find((item) => item.id === vote.mascotId);
      return mascot ? [{ vote, mascot }] : [];
    });

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-24 pt-6">
      <section className="rounded-2xl border border-arena-border bg-arena-surface p-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.username}
            className="h-16 w-16 rounded-full border-2 border-neon-cyan object-cover"
          />
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
        <div className="flex gap-3 overflow-x-auto pb-2">
          {currentUser.badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs tracking-widest text-neon-cyan">SUPPORTED ARTISTS</h2>
        <p className="mb-2 text-xs text-arena-muted">Live Voting Registry</p>
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
      </section>
    </main>
  );
}