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
import { Mascot } from "@/types/mascots";

interface MascotsContextValue {
  mascots: Mascot[];
  selectedMascot: Mascot | null;
  loading: boolean;
  error: string | null;
  fetchMascotById: (id: number) => Promise<void>;
}

const MascotsContext = createContext<MascotsContextValue | undefined>(
  undefined
);

export function MascotsProvider({ children }: { children: ReactNode }) {
  const [mascots, setMascots] = useState<Mascot []>([]);
  const [selectedMascot, setSelectedMascot] = useState<Mascot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<Mascot []>("/mascots")
  .then(({ data }) => {
    if (!cancelled) setMascots(data);
    })
  .catch(() => {
    if (!cancelled)
      setError("No se pudieron cargar los productos");
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

  const fetchMascotById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Mascot>(`/mascots/${id}`);
      setSelectedMascot(data);
    } catch {
      setError("No se pudo cargar el producto");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <MascotsContext.Provider
      value={{ mascots, selectedMascot, loading, error, fetchMascotById }}
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