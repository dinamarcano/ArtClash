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
import { CreateMascotData, Mascot, Ranking } from "@/types/mascots";

interface MascotsContextValue {
  mascots: Mascot[];
  ranking: Ranking | null;
  loading: boolean;
  error: string | null;
  refreshMascots: () => Promise<void>;
  myMascots: Mascot[];
  myMascotsLoading: boolean;
  creating: boolean;
  deletingId: number | null;
  createMascot: (data: CreateMascotData) => Promise<boolean>;
  deleteMascot: (id: number) => Promise<boolean>;
}

const MascotsContext = createContext<MascotsContextValue | undefined>(undefined);

export function MascotsProvider({ children }: { children: ReactNode }) {
  const [mascots, setMascots] = useState<Mascot[]>([]);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myMascots, setMyMascots] = useState<Mascot[]>([]);
  const [myMascotsLoading, setMyMascotsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { status, isArtist } = useAuth();

  useEffect(() => {
    if (status !== "authenticated" || !isArtist) return;
    let cancelled = false;

    const loadMyMascots = async () => {
      try {
        const { data } = await api.get<Mascot[]>("/mascots/mine");
        if (!cancelled) setMyMascots(data);
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error, "No se pudo cargar tu arte"));
      } finally {
        if (!cancelled) setMyMascotsLoading(false);
      }
    };

    loadMyMascots();

    return () => {
      cancelled = true;
    };
  }, [status, isArtist]);

  const refreshMascots = useCallback(async () => {
    try {
      const [mascotsResponse, rankingResponse] = await Promise.all([
        api.get<Mascot[]>("/mascots"),
        api.get<Ranking>("/mascots/ranking"),
      ]);
      setMascots(mascotsResponse.data);
      setRanking(rankingResponse.data);
      setError(null);
    } catch (error) {
      const message = getErrorMessage(error, "No se pudieron cargar las mascotas");
      setError(message);
      toast.error(message, { id: "mascots-error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadMascots = async () => {
      await refreshMascots();
    };
    loadMascots();
  }, [status, refreshMascots]);

  const createMascot = useCallback(async (data: CreateMascotData) => {
    setCreating(true);
    try {
      const { data: created } = await api.post<Mascot>("/mascots", data);
      setMyMascots((current) => [created, ...current]);
      setMascots((current) => [...current, created]);
      toast.success(`"${created.name}" ya está en la arena`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo subir el arte"));
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  const deleteMascot = useCallback(async (id: number) => {
    setDeletingId(id);
    try {
      await api.delete(`/mascots/${id}`);
      setMyMascots((current) => current.filter((mascot) => mascot.id !== id));
      setMascots((current) => current.filter((mascot) => mascot.id !== id));
      toast.success("Arte eliminado");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo borrar el arte"));
      return false;
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <MascotsContext.Provider
      value={{
        mascots,
        ranking,
        loading,
        error,
        refreshMascots,
        myMascots,
        myMascotsLoading,
        creating,
        deletingId,
        createMascot,
        deleteMascot,
      }}
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