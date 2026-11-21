"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import MascotPicker from "@/components/MascotPicker";
import PrivateRoute from "@/components/PrivateRoute";
import { useMascots } from "@/context/MascotsContext";
import { useRooms } from "@/context/RoomsContext";

const MIN_DURATION = 60;
const MAX_DURATION = 120;
const DURATION_STEP = 15;

interface FormErrors {
  mascotA?: string;
  mascotB?: string;
}

function NewRoomContent() {
  const router = useRouter();
  const { mascots, loading, refreshMascots } = useMascots();
  const { createRoom, creating } = useRooms();
  const [mascotAId, setMascotAId] = useState<number | null>(null);
  const [mascotBId, setMascotBId] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(90);
  const [errors, setErrors] = useState<FormErrors>({});

  // Trae el catálogo actualizado (puede haber arte nuevo de otros artistas)
  useEffect(() => {
    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadCatalog = async () => {
      await refreshMascots();
    };
    loadCatalog();
  }, [refreshMascots]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: FormErrors = {};
    if (mascotAId === null) found.mascotA = "Elige el arte de la esquina roja";
    if (mascotBId === null) found.mascotB = "Elige el arte de la esquina azul";
    setErrors(found);
    if (mascotAId === null || mascotBId === null) return;

    const code = await createRoom({ mascotAId, mascotBId, durationSeconds });
    // La sala queda en espera: allí se ve el código y el botón "Iniciar"
    if (code) router.push(`/room?code=${code}`);
  };

  if (loading) return <LoadingState label="Cargando artes" />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-24 pt-6">
      <header>
        <h1 className="text-xs tracking-widest text-neon-cyan">NUEVA VOTACIÓN</h1>
        <p className="mt-1 text-sm text-arena-muted">
          Elige los dos artes que se van a enfrentar y cuánto dura la votación
        </p>
      </header>

      {mascots.length < 2 ? (
        <EmptyState
          title="Faltan contrincantes"
          message="Se necesitan al menos dos artes en la arena para crear una votación"
          action={
            <Link href="/my-art" className="text-sm text-neon-cyan underline">
              Subir arte
            </Link>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <MascotPicker
            corner="red"
            mascots={mascots}
            selectedId={mascotAId}
            blockedId={mascotBId}
            onSelect={(id) => {
              setMascotAId(id);
              setErrors((current) => ({ ...current, mascotA: undefined }));
            }}
            disabled={creating}
            error={errors.mascotA}
          />

          <p className="text-center font-bold text-neon-pink">VS</p>

          <MascotPicker
            corner="blue"
            mascots={mascots}
            selectedId={mascotBId}
            blockedId={mascotAId}
            onSelect={(id) => {
              setMascotBId(id);
              setErrors((current) => ({ ...current, mascotB: undefined }));
            }}
            disabled={creating}
            error={errors.mascotB}
          />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="duration"
              className="flex justify-between text-xs tracking-widest text-arena-muted"
            >
              <span>DURACIÓN</span>
              <span className="font-bold text-neon-cyan">{durationSeconds} s</span>
            </label>
            <input
              id="duration"
              type="range"
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={DURATION_STEP}
              value={durationSeconds}
              onChange={(event) => setDurationSeconds(Number(event.target.value))}
              disabled={creating}
              className="accent-neon-pink"
            />
            <div className="flex justify-between text-[10px] text-arena-muted">
              <span>1 min</span>
              <span>2 min</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="flex items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-60"
          >
            {creating && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            )}
            {creating ? "CREANDO SALA..." : "CREAR SALA"}
          </button>
        </form>
      )}
    </main>
  );
}

// Además de la sesión (layout del grupo), esta pantalla exige rol de artista
export default function NewRoomPage() {
  return (
    <PrivateRoute role="artist">
      <NewRoomContent />
    </PrivateRoute>
  );
}
