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
import { api } from "@/lib/api";
import { User } from "@/types/users";

interface UsersContextValue {
  users: User[];
  currentUser: User | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  getUserById: (id: number) => Promise<void>;
}

const UsersContext = createContext<UsersContextValue | undefined>(
  undefined
);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // Empieza en true: la carga arranca apenas se monta el provider
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const loadUsers = async () => {
      try {
        const { data } = await api.get<User[]>("/users");
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) {
          setError("No se pudieron cargar los usuarios");
          toast.error("No se pudieron cargar los usuarios");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const getUserById = useCallback(async (id: number) => {
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

  const currentUser = users.find((user) => user.id === 1) || null;

  return (
    <UsersContext.Provider
      value={{ users, selectedUser, currentUser, loading, error, getUserById }}
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