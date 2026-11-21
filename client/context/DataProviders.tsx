"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { MascotsProvider } from "@/context/MascotsContext";
import { RoomsProvider } from "@/context/RoomsContext";
import { VotesProvider } from "@/context/VotesContext";

// Providers de datos de la app. La "key" con el id del usuario hace que React
// los cree de cero cuando cambia la sesión (logout o entra otra persona):
// así nunca quedan en pantalla datos del usuario anterior.
export default function DataProviders({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <MascotsProvider key={user?.id ?? "guest"}>
      <VotesProvider>
        <RoomsProvider>{children}</RoomsProvider>
      </VotesProvider>
    </MascotsProvider>
  );
}
