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
import { getErrorMessage } from "@/lib/errors";
import { Vote } from "@/types/votes";

interface VotesContextValue {
  votes: Vote[];
  loading: boolean;
  reloadVotes: () => Promise<void>;
}

const VotesContext = createContext<VotesContextValue | undefined>(undefined);

export function VotesProvider({ children }: { children: ReactNode }) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useAuth();

  const reloadVotes = useCallback(async () => {
    try {
      const { data } = await api.get<Vote[]>("/votes/mine");
      setVotes(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar tus votos"), {
        id: "votes-error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadVotes = async () => {
      await reloadVotes();
    };
    loadVotes();
  }, [status, reloadVotes]);

  return (
    <VotesContext.Provider value={{ votes, loading, reloadVotes }}>
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
