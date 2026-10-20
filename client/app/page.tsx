"use client";

import { useState } from "react";
import { useRooms } from "@/context/RoomsContext";

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function Home() {
  const { room, loading, error, joinRoom, leaveRoom } = useRooms();
  const [code, setCode] = useState("");

  if (!room) {
    return (
      <div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          placeholder="Código de 6 dígitos"
        />
        <button onClick={() => joinRoom(code)}>Entrar</button>
        {loading && <p>Cargando...</p>}
        {error && <p>{error}</p>}
      </div>
    );
  }

 
  const [a, b] = room.contenders;
  const winner = room.contenders.find(
    (contender) => contender.mascot.id === room.winnerMascotId
  );

  return (
    <div>
      <p>
        Sala {room.code} · Ronda {room.round}
      </p>

      <p>
        {room.status === "live"
          ? `Tiempo restante: ${formatTime(room.secondsRemaining)}`
          : `Votación cerrada · nueva ronda en ${formatTime(room.secondsRemaining)}`}
      </p>

      <p>
        {a.mascot.name} ({a.mascot.artistHandle}): {a.votes} votos ({a.percentage}%)
      </p>
      <p>
        {b.mascot.name} ({b.mascot.artistHandle}): {b.votes} votos ({b.percentage}%)
      </p>

      {room.status === "finished" && (
        <p>{room.isTie ? "¡Empate!" : `Ganador: ${winner?.mascot.name}`}</p>
      )}

      <ul>
        {room.recentVotes.map((vote, index) => (
          <li key={index}>
            {vote.username} votó por {vote.mascotName} (+{vote.xpAwarded} XP) · hace{" "}
            {vote.secondsAgo}s
          </li>
        ))}
      </ul>

      <button onClick={leaveRoom}>Salir de la sala</button>
    </div>
  );
}