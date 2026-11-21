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
  selectedMascot: Mascot | null;
  loading: boolean;
  error: string | null;
  loadMascotById: (id: number) => Promise<void>;
  // Arte del artista con sesión (vacío si es fan)
  myMascots: Mascot[];
  myMascotsLoading: boolean;
  creating: boolean;
  // Id del arte que se está borrando, para mostrar "borrando" solo en esa tarjeta
  deletingId: number | null;
  createMascot: (data: CreateMascotData) => Promise<boolean>;
  deleteMascot: (id: number) => Promise<boolean>;
}

const MascotsContext = createContext<MascotsContextValue | undefined>(undefined);

export function MascotsProvider({ children }: { children: ReactNode }) {
  const [mascots, setMascots] = useState<Mascot[]>([]);
  const [ranking, setRanking] = useState<Ranking | null>(null);
  const [selectedMascot, setSelectedMascot] = useState<Mascot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myMascots, setMyMascots] = useState<Mascot[]>([]);
  const [myMascotsLoading, setMyMascotsLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { status, isArtist } = useAuth();

  // Solo los artistas tienen "mi arte"
  useEffect(() => {
    if (status !== "authenticated" || !isArtist) return;
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
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

  const createMascot = useCallback(async (data: CreateMascotData) => {
    setCreating(true);
    try {
      const { data: created } = await api.post<Mascot>("/mascots", data);
      // Se agrega a las listas sin volver a pedirlas al servidor
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
      // Por ejemplo: 409 si ya participó en una votación
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
        selectedMascot,
        loading,
        error,
        loadMascotById,
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