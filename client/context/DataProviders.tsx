"use client";

import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { MascotsProvider } from "@/context/MascotsContext";
import { RoomsProvider } from "@/context/RoomsContext";
import { VotesProvider } from "@/context/VotesContext";

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
