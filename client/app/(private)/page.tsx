"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRooms } from "@/context/RoomsContext";

export default function ScanPage() {
  const router = useRouter();
  const { isArtist } = useAuth();
  const { joinRoom, joining } = useRooms();
  const [code, setCode] = useState("");

  const isValid = /^\d{6}$/.test(code);

  const handleJoin = async (event: FormEvent) => {
    event.preventDefault();
    if (!isValid || joining) return;
    // Solo navega si la sala existe; si no, el provider muestra un toast
    const ok = await joinRoom(code);
    if (ok) router.push("/room");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-8 px-6 pb-24 pt-10">
      <Image
        src="/logo.png"
        alt="ArtClash"
        width={160}
        height={40}
        priority
        className="h-auto w-40"
      />

      <div className="relative flex aspect-square w-full max-w-xs items-end justify-center rounded-2xl border border-arena-border bg-arena-surface p-4">
        <span className="absolute left-4 top-4 text-xs tracking-widest text-neon-cyan">
          SCAN QR
        </span>
        <span className="absolute right-4 top-4 text-[10px] tracking-widest text-neon-cyan">
          AUTO-DETECT ACTIVE
        </span>
        <div className="absolute left-10 top-12 h-8 w-8 border-l-2 border-t-2 border-neon-cyan" />
        <div className="absolute right-10 top-12 h-8 w-8 border-r-2 border-t-2 border-neon-cyan" />
        <div className="absolute bottom-16 left-10 h-8 w-8 border-b-2 border-l-2 border-neon-cyan" />
        <div className="absolute bottom-16 right-10 h-8 w-8 border-b-2 border-r-2 border-neon-cyan" />
        <p className="text-sm text-arena-muted">Apunta al código en el stand</p>
      </div>

      {/* form: también permite entrar con la tecla Enter */}
      <form onSubmit={handleJoin} className="flex w-full flex-col gap-3">
        <label
          htmlFor="room-code"
          className="text-xs tracking-widest text-arena-muted"
        >
          O INGRESA EL CÓDIGO DE LA SALA
        </label>
        <input
          id="room-code"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          disabled={joining}
          placeholder="000000"
          className="rounded-xl border border-arena-border bg-arena-surface py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-neon-pink disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!isValid || joining}
          className="flex items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-40"
        >
          {joining && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
          )}
          {joining ? "ENTRANDO..." : "ENTRAR A LA SALA"}
        </button>
        <p className="text-center text-xs text-arena-muted">
          {code.length > 0 && !isValid
            ? `Faltan ${6 - code.length} dígitos`
            : "El código de 6 dígitos está en la pantalla del stand"}
        </p>
      </form>

      {isArtist && (
        <Link
          href="/new-room"
          className="w-full rounded-xl border-2 border-neon-cyan py-3 text-center text-xs font-bold tracking-widest text-neon-cyan"
        >
          + CREAR UNA VOTACIÓN
        </Link>
      )}
    </main>
  );
}