"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, setSessionExpiredHandler } from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";
import { tokenStorage } from "@/lib/tokenStorage";
import { AuthSession, LoginData, RegisterData } from "@/types/auth";
import { User } from "@/types/users";

// loading: todavía no sabemos si hay sesión (al abrir la app)
type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isArtist: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Al abrir la app: si hay tokens guardados, recupera el usuario
  useEffect(() => {
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const restoreSession = async () => {
      if (!tokenStorage.getRefreshToken()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        // Si el access token venció, el interceptor lo renueva solo
        const { data } = await api.get<User>("/auth/me");
        if (cancelled) return;
        setUser(data);
        setStatus("authenticated");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Qué hacer cuando el interceptor ya no pudo renovar el token
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
      // El id evita varios toasts si fallaron varias peticiones a la vez
      toast.error("Tu sesión expiró, vuelve a iniciar sesión", {
        id: "session-expired",
      });
      router.replace("/login");
    });
    return () => setSessionExpiredHandler(null);
  }, [router]);

  // Guarda los tokens y carga el perfil completo del usuario
  const startSession = useCallback(async (session: AuthSession) => {
    tokenStorage.setTokens(session.accessToken, session.refreshToken);
    const { data } = await api.get<User>("/auth/me");
    setUser(data);
    setStatus("authenticated");
  }, []);

  const login = useCallback(
    async (data: LoginData) => {
      try {
        const { data: session } = await api.post<AuthSession>("/auth/login", data);
        await startSession(session);
        toast.success(`¡Hola de nuevo, ${session.user.username}!`);
        router.replace("/");
        return true;
      } catch (error) {
        tokenStorage.clear();
        toast.error(getErrorMessage(error, "No se pudo iniciar sesión"));
        return false;
      }
    },
    [router, startSession]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const { data: session } = await api.post<AuthSession>("/auth/register", data);
        await startSession(session);
        toast.success(`¡Bienvenido a ArtClash, ${session.user.username}!`);
        router.replace("/");
        return true;
      } catch (error) {
        tokenStorage.clear();
        toast.error(getErrorMessage(error, "No se pudo crear la cuenta"));
        return false;
      }
    },
    [router, startSession]
  );

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      // Anula el refresh token en el servidor
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      // Aunque falle la red, la sesión local se cierra igual
    }
    tokenStorage.clear();
    setUser(null);
    setStatus("unauthenticated");
    toast.success("Sesión cerrada");
    router.replace("/login");
  }, [router]);

  // Para recargar XP, nivel, etc. después de votar
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar tu perfil"));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isArtist: user?.role === "artist",
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
