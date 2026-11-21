"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
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
  const { status } = useAuth();

  useEffect(() => {
    // Las rutas del servidor exigen sesión: sin ella no se pide nada
    if (status !== "authenticated") return;
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadMascots = async () => {
      try {
        const [mascotsResponse, rankingResponse] = await Promise.all([
          api.get<Mascot[]>("/mascots"),
          api.get<Ranking>("/mascots/ranking"),
        ]);
        if (cancelled) return;
        setMascots(mascotsResponse.data);
        setRanking(rankingResponse.data);
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar las mascotas");
          toast.error("No se pudieron cargar las mascotas");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMascots();

    return () => {
      cancelled = true;
    };
  }, [status]);

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