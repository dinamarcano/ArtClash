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
import { Client } from "@/types/client";

interface ClientsContextValue {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;
  fetchClientById: (id: number) => Promise<void>;
}

const ClientsContext = createContext<ClientsContextValue | undefined>(
  undefined
);

export function ClientsProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<Client[]>("/clients")
  .then(({ data }) => {
    if (!cancelled) setClients(data);
    })
  .catch(() => {
    if (!cancelled)
      setError("No se pudieron cargar los clientes");
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

  const fetchClientById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Client>(`/clients/${id}`);
      setSelectedClient(data);
    } catch {
      setError("No se pudo cargar el cliente");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ClientsContext.Provider
      value={{ clients, selectedClient, loading, error, fetchClientById }}
    >
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients debe usarse dentro de ClientsProvider");
  }
  return context;
}