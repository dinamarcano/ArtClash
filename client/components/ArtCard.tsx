"use client";

import { useState } from "react";
import { Mascot } from "@/types/mascots";

interface ArtCardProps {
  mascot: Mascot;
  deleting: boolean;
  onDelete: (id: number) => Promise<boolean>;
}

export default function ArtCard({ mascot, deleting, onDelete }: ArtCardProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    const ok = await onDelete(mascot.id);
    if (!ok) setConfirming(false);
  };

  return (
    <li className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-surface p-3">
      <img
        src={mascot.imageUrl}
        alt={mascot.name}
        className="h-14 w-14 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{mascot.name}</p>
        <p className="text-xs text-arena-muted">{mascot.totalVotes} votos</p>
      </div>

      {deleting ? (
        <span className="flex items-center gap-2 text-xs tracking-widest text-corner-red">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-corner-red/30 border-t-corner-red" />
          BORRANDO...
        </span>
      ) : confirming ? (
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest">
          <span className="text-arena-muted">¿BORRAR?</span>
          <button onClick={handleConfirm} className="text-corner-red">
            SÍ
          </button>
          <button onClick={() => setConfirming(false)} className="text-arena-muted">
            NO
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          aria-label={`Borrar ${mascot.name}`}
          className="rounded-lg border border-arena-border px-3 py-2 text-xs tracking-widest text-arena-muted transition hover:border-corner-red hover:text-corner-red"
        >
          BORRAR
        </button>
      )}
    </li>
  );
}
