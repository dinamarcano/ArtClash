"use client";

import ArtCard from "@/components/ArtCard";
import ArtForm from "@/components/ArtForm";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import PrivateRoute from "@/components/PrivateRoute";
import { useMascots } from "@/context/MascotsContext";

function MyArtContent() {
  const {
    myMascots,
    myMascotsLoading,
    creating,
    deletingId,
    createMascot,
    deleteMascot,
  } = useMascots();

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 pb-24 pt-6">
      <header>
        <h1 className="text-xs tracking-widest text-neon-cyan">MI ARTE</h1>
        <p className="mt-1 text-sm text-arena-muted">
          Sube tus mascotas para ponerlas a competir en la arena
        </p>
      </header>

      <ArtForm creating={creating} onSubmit={createMascot} />

      <section className="flex flex-col gap-3">
        <h2 className="text-xs tracking-widest text-neon-pink">
          TUS MASCOTAS {!myMascotsLoading && `(${myMascots.length})`}
        </h2>

        {myMascotsLoading ? (
          <LoadingState label="Cargando tu arte" compact />
        ) : myMascots.length === 0 ? (
          <EmptyState
            title="Aún no has subido arte"
            message="Usa el formulario de arriba para subir tu primera mascota"
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {myMascots.map((mascot) => (
              <ArtCard
                key={mascot.id}
                mascot={mascot}
                deleting={deletingId === mascot.id}
                onDelete={deleteMascot}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default function MyArtPage() {
  return (
    <PrivateRoute role="artist">
      <MyArtContent />
    </PrivateRoute>
  );
}
