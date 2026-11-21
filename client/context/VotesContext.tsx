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
import { Vote } from "@/types/votes";

interface VotesContextValue {
  votes: Vote[];
  selectedVote: Vote | null;
  loading: boolean;
  error: string | null;
  getVoteById: (id: number) => Promise<void>;
}

const VotesContext = createContext<VotesContextValue | undefined>(
  undefined
);

export function VotesProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  // Empieza en true: la carga arranca apenas se monta el provider
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();

  useEffect(() => {
    // Las rutas del servidor exigen sesión: sin ella no se pide nada
    if (status !== "authenticated") return;
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadVotes = async () => {
      try {
        const { data } = await api.get<Vote[]>("/votes");
        if (!cancelled) setVotes(data);
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar los votos");
          toast.error("No se pudieron cargar los votos");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadVotes();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const getVoteById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Vote>(`/votes/${id}`);
      setSelectedVote(data);
    } catch {
      setError("No se pudo cargar el voto");
    } finally {
      setLoading(false);
    }
  }, []);


  return (
    <VotesContext.Provider
      value={{ votes, selectedVote, loading, error, getVoteById }}
    >
      {children}
    </VotesContext.Provider>
  );
}

export function useVotes() {
  const context = useContext(VotesContext);
  if (!context) {
    throw new Error("useVotes debe usarse dentro de VotesProvider");
  }
  return context;
}