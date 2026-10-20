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
import { Vote } from "@/types/votes";

interface VotesContextValue {
  votes: Vote[];
  selectedVote: Vote | null;
  loading: boolean;
  error: string | null;
  fetchVoteById: (id: number) => Promise<void>;
}

const VotesContext = createContext<VotesContextValue | undefined>(
  undefined
);

export function VotesProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<Vote[]>("/votes")
  .then(({ data }) => {
    if (!cancelled) setVotes(data);
    })
  .catch(() => {
    if (!cancelled)
      setError("No se pudieron cargar los pagos");
    })
  .finally(() => {
    if (!cancelled) {
      setLoading(false);
    }
  });
return () => {
  cancelled = true;
};
}, []);

  const fetchVoteById = useCallback(async (id: number) => {
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
      value={{ votes, selectedVote, loading, error, fetchVoteById }}
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