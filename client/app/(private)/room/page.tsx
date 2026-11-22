"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { useRooms } from "@/context/RoomsContext";
import { RoomContender, RoomStatus } from "@/types/rooms";

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

const statusLabels: Record<RoomStatus, string> = {
  waiting: "ESPERANDO INICIO",
  live: "VOTACIÓN EN VIVO",
  finished: "VOTACIÓN CERRADA",
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

interface ContenderCardProps {
  contender: RoomContender;
  corner: "red" | "blue";
  onSelect?: () => void;
  selected?: boolean;
  isMyVote?: boolean;
}

function ContenderCard({ contender, corner, onSelect, selected, isMyVote }: ContenderCardProps) {
  const style = cornerStyles[corner];
  const highlighted = selected || isMyVote;

  const content = (
    <>
      <p className={`flex justify-between text-[10px] tracking-widest ${style.text}`}>
        <span>{style.label}</span>
        {isMyVote && <span>✓ TU VOTO</span>}
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
    </>
  );

  const className = `rounded-2xl border-2 bg-arena-surface p-3 text-left transition ${style.border} ${
    highlighted ? "shadow-[0_0_20px] shadow-neon-pink/60 ring-2 ring-neon-pink" : ""
  }`;

  return onSelect ? (
    <button type="button" onClick={onSelect} aria-pressed={selected} className={className}>
      {content}
    </button>
  ) : (
    <div className={className}>{content}</div>
  );
}

const roomLoading = (
  <main className="flex min-h-screen items-center justify-center">
    <LoadingState label="Entrando a la sala" />
  </main>
);

export default function RoomPage() {
  return (
    <Suspense fallback={roomLoading}>
      <RoomContent />
    </Suspense>
  );
}

function RoomContent() {
  const router = useRouter();
  const code = useSearchParams().get("code") ?? "";
  const { user } = useAuth();
  const {
    room: currentRoom,
    receivedAt,
    live,
    starting,
    votingFor,
    joinRoom,
    startRoom,
    vote,
    leaveRoom,
  } = useRooms();
  const [now, setNow] = useState(() => Date.now());
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const joinAttempted = useRef<string | null>(null);
  const leaving = useRef(false);

  const room = currentRoom?.code === code ? currentRoom : null;

  useEffect(() => {
    if (room || leaving.current || joinAttempted.current === code) return;
    if (!/^\d{6}$/.test(code)) {
      router.replace("/");
      return;
    }
    joinAttempted.current = code;

    const enterFromUrl = async () => {
      const ok = await joinRoom(code);
      if (!ok) router.replace("/");
    };
    enterFromUrl();
  }, [room, code, joinRoom, router]);

  useEffect(() => {
    if (room?.status !== "live") return;
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [room?.status]);

  const handleLeave = () => {
    leaving.current = true;
    leaveRoom();
    router.push("/");
  };

  if (!room) return roomLoading;

  const [a, b] = room.contenders;
  const isCreator = user?.id === room.artistId;
  const isFan = user?.role === "user";
  const myVote = room.myVoteMascotId;
  const canVote = isFan && room.status === "live" && myVote === null;
  const sending = votingFor !== null;
  const votedName = room.contenders.find((c) => c.mascot.id === myVote)?.mascot.name;

  const handleVote = async () => {
    if (selectedId === null) return;
    const ok = await vote(selectedId);
    if (ok) setSelectedId(null);
  };

  const cardProps = (contender: RoomContender) => ({
    contender,
    selected: canVote && selectedId === contender.mascot.id,
    isMyVote: myVote === contender.mascot.id,
    onSelect:
      canVote && !sending ? () => setSelectedId(contender.mascot.id) : undefined,
  });
  const winner = room.contenders.find(
    (contender) => contender.mascot.id === room.winnerMascotId
  );
  const elapsed = Math.max(0, Math.floor((now - receivedAt) / 1000));
  const secondsLeft =
    room.status === "live"
      ? Math.max(0, room.secondsRemaining - elapsed)
      : room.secondsRemaining;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-6">
      <header className="text-center">
        <p className="flex items-center justify-center gap-2 text-xs tracking-widest text-arena-muted">
          SALA {room.code}
          {room.status !== "finished" && (
            <span className={`flex items-center gap-1 ${live ? "text-neon-cyan" : "text-arena-muted"}`}>
              <span
                className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-neon-cyan" : "bg-arena-muted"}`}
              />
              {live ? "EN VIVO" : "CONECTANDO..."}
            </span>
          )}
        </p>
        <p className="mt-1 text-4xl font-bold tabular-nums text-neon-cyan">
          {formatTime(secondsLeft)}
        </p>
        <p className="text-xs tracking-widest text-neon-pink">
          {statusLabels[room.status]}
        </p>
      </header>

      {room.status === "waiting" && (
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-neon-cyan bg-arena-surface p-4 text-center">
          <p className="text-[10px] tracking-widest text-arena-muted">
            CÓDIGO DE LA SALA
          </p>
          <p className="text-4xl font-bold tracking-[0.3em] text-neon-cyan tabular-nums">
            {room.code}
          </p>
          {isCreator ? (
            <>
              <p className="text-xs text-arena-muted">
                Comparte el código y da inicio cuando el público esté listo
              </p>
              <button
                onClick={startRoom}
                disabled={starting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-60"
              >
                {starting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                )}
                {starting ? "INICIANDO..." : "INICIAR VOTACIÓN"}
              </button>
            </>
          ) : (
            <p className="flex items-center gap-2 text-xs text-arena-muted">
              <span className="h-2 w-2 animate-pulse rounded-full bg-neon-pink" />
              Esperando a que el artista inicie la votación...
            </p>
          )}
        </section>
      )}

      <section className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <ContenderCard corner="red" {...cardProps(a)} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-neon-pink font-bold text-neon-pink">
          VS
        </div>
        <ContenderCard corner="blue" {...cardProps(b)} />
      </section>

      <div className="flex h-2 overflow-hidden rounded-full bg-arena-border">
        <div className="bg-corner-red" style={{ width: `${a.percentage}%` }} />
        <div className="bg-corner-blue" style={{ width: `${b.percentage}%` }} />
      </div>

      {room.status === "finished" && (
        <div className="rounded-xl border border-neon-pink bg-arena-surface p-4 text-center text-xl font-bold text-neon-pink">
          {room.isTie ? "¡EMPATE!" : `GANADOR: ${winner?.mascot.name}`}
        </div>
      )}

      {canVote && (
        <div className="flex flex-col gap-1">
          <button
            onClick={handleVote}
            disabled={selectedId === null || sending}
            className="flex items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-40"
          >
            {sending && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            )}
            {sending ? "ENVIANDO VOTO..." : "VOTE MASCOT"}
          </button>
          <p className="text-center text-xs text-arena-muted">
            {selectedId === null
              ? "Toca la tarjeta de tu favorito para elegirlo"
              : "Solo tienes un voto: confirma tu elección"}
          </p>
        </div>
      )}

      {myVote !== null && (
        <p className="rounded-xl border border-neon-cyan bg-arena-surface p-3 text-center text-sm text-neon-cyan">
          ✓ Votaste por <span className="font-bold">{votedName}</span>
          {room.status === "live" && " · los resultados se actualizan en vivo"}
        </p>
      )}

      {!isFan && room.status === "live" && (
        <p className="text-center text-xs text-arena-muted">
          Los artistas compiten: solo los fans pueden votar
        </p>
      )}

      <section className="rounded-2xl border border-arena-border bg-arena-surface p-4">
        <h3 className="mb-3 text-xs tracking-widest text-neon-cyan">
          RECENT VOTES
        </h3>
        {room.recentVotes.length === 0 ? (
          <EmptyState
            title="Aún no hay votos"
            message={
              room.status === "waiting"
                ? "Los votos aparecerán aquí en cuanto empiece la votación"
                : "Sé el primero en apoyar a tu artista favorito"
            }
          />
        ) : (
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
        )}
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
