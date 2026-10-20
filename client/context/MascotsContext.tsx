"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { Mascot, Ranking } from "@/types/mascots";

interface MascotsContextValue {
  mascots: Mascot[];
  ranking: Ranking | null;
  selectedMascot: Mascot | null;
  loading: boolean;
  error: string | null;
  loadMascotById: (id: number) => Promise<void>;
}

const MascotsContext = createContext<MascotsContextValue | undefined>(undefined);

export function MascotsProvider({ children }: { children: ReactNode }) {
  const [mascots, setMascots] = useState<Mascot[]>([]);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [selectedMascot, setSelectedMascot] = useState<Mascot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get<Mascot[]>("/mascots"),
      api.get<Ranking>("/mascots/ranking"),
    ])
      .then(([mascotsResponse, rankingResponse]) => {
        if (cancelled) return;
        setMascots(mascotsResponse.data);
        setRanking(rankingResponse.data);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las mascotas");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loadMascotById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Mascot>(`/mascots/${id}`);
      setSelectedMascot(data);
    } catch {
      setError("No se pudo cargar la mascota");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MascotsContext.Provider
      value={{ mascots, ranking, selectedMascot, loading, error, loadMascotById }}
    >
      {children}
    </MascotsContext.Provider>
  );
}

export function useMascots() {
  const context = useContext(MascotsContext);
  if (!context) {
    throw new Error("useMascots debe usarse dentro de MascotsProvider");
  }
  return context;
}