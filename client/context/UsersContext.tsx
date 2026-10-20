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
import { User } from "@/types/users";

interface UsersContextValue {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  fetchUserById: (id: number) => Promise<void>;
}

const UsersContext = createContext<UsersContextValue | undefined>(
  undefined
);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

 useEffect(() =>{
  let cancelled = false;

 api
  .get<User[]>("/users")
  .then(({ data }) => {
    if (!cancelled) setUsers(data);
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

  const fetchUserById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<User>(`/users/${id}`);
      setSelectedUser(data);
    } catch {
      setError("No se pudo cargar el usuario");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UsersContext.Provider
      value={{ users, selectedUser, loading, error, fetchUserById }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers debe usarse dentro de UsersProvider");
  }
  return context;
}