"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRooms } from "@/context/RoomsContext";
import { RoomContender } from "@/types/rooms";

const cornerStyles = {
  red: {
    border: "border-corner-red",
    text: "text-corner-red",
    label: "RED CORNER",
  },
  blue: {
    border: "border-corner-blue",
    text: "text-corner-blue",
    label: "BLUE CORNER",
  },
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

function ContenderCard({
  contender,
  corner,
}: {
  contender: RoomContender;
  corner: "red" | "blue";
}) {
  const style = cornerStyles[corner];

  return (
    <div
      className={`rounded-2xl border-2 bg-arena-surface p-3 ${style.border}`}
    >
      <p className={`text-[10px] tracking-widest ${style.text}`}>
        {style.label}
      </p>
      <img
        src={contender.mascot.imageUrl}
        alt={contender.mascot.name}
        className="my-2 aspect-square w-full rounded-lg object-cover"
      />
      <h2 className="text-lg font-bold">{contender.mascot.name}</h2>
      <p className="text-xs text-arena-muted">{contender.mascot.artistHandle}</p>
      <p className={`mt-2 text-3xl font-bold ${style.text}`}>
        {contender.percentage}%
      </p>
      <p className="text-xs text-arena-muted">{contender.votes} votos</p>
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const { room, loading, error, leaveRoom } = useRooms();

  useEffect(() => {
    if (!room && !loading && !error) router.replace("/");
  }, [room, loading, error, router]);

  const handleLeave = () => {
    leaveRoom();
    router.push("/");
  };

  if (error) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6">
        <p className="text-corner-red">{error}</p>
        <button
          onClick={handleLeave}
          className="rounded-xl border border-arena-border px-6 py-2"
        >
          Volver
        </button>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-arena-muted">Cargando sala...</p>
      </main>
    );
  }

  const [a, b] = room.contenders;
  const isLive = room.status === "live";
  const winner = room.contenders.find(
    (contender) => contender.mascot.id === room.winnerMascotId
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <p className="text-xs tracking-widest text-arena-muted">
          SALA {room.code} · RONDA {room.round}
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-neon-cyan">
          {formatTime(room.secondsRemaining)}
        </p>
        <p className="text-xs tracking-widest text-neon-pink">
          {isLive ? "VOTACIÓN EN VIVO" : "VOTACIÓN CERRADA · NUEVA RONDA EN CAMINO"}
        </p>
      </header>

      <section className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ContenderCard contender={a} corner="red" />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neon-pink font-bold text-neon-pink">
          VS
        </div>
        <ContenderCard contender={b} corner="blue" />
      </section>

      <div className="flex h-2 overflow-hidden rounded-full bg-arena-border">
        <div className="bg-corner-red" style={{ width: `${a.percentage}%` }} />
        <div className="bg-corner-blue" style={{ width: `${b.percentage}%` }} />
      </div>

      {!isLive && (
        <div className="rounded-xl border border-neon-pink bg-arena-surface p-4 text-center text-xl font-bold text-neon-pink">
          {room.isTie ? "¡EMPATE!" : `GANADOR: ${winner?.mascot.name}`}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <button
          disabled
          className="rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black opacity-50"
        >
          VOTE MASCOT
        </button>
        <p className="text-center text-xs text-arena-muted">
          Demo: los votos los simula el servidor
        </p>
      </div>

      <section className="rounded-2xl border border-arena-border bg-arena-surface p-4">
        <h3 className="mb-3 text-xs tracking-widest text-neon-cyan">
          RECENT VOTES
        </h3>
        <ul className="flex flex-col gap-2 text-sm">
          {room.recentVotes.map((vote, index) => (
            <li key={index} className="flex justify-between gap-2">
              <span>
                @{vote.username} votó por{" "}
                <span className="font-semibold">{vote.mascotName}</span>
              </span>
              <span className="text-arena-muted">
                +{vote.xpAwarded} XP · {vote.secondsAgo}s
              </span>
            </li>
          ))}
        </ul>
      </section>

      <button
        onClick={handleLeave}
        className="text-sm text-arena-muted underline"
      >
        Salir de la sala
      </button>
    </main>
  );
}