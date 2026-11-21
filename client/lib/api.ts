import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "@/lib/tokenStorage";
import { AuthSession } from "@/types/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({ baseURL });

// 1) Antes de cada petición: adjunta el access token si hay sesión
api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// El AuthProvider registra aquí qué hacer cuando la sesión ya no se puede
// renovar (limpiar estado, avisar y mandar al login)
let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

// Si varias peticiones fallan a la vez, todas esperan UNA sola renovación
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = tokenStorage.getRefreshToken();
  // axios "pelado" y no `api`: así esta llamada no pasa por estos interceptores
  const { data } = await axios.post<AuthSession>(`${baseURL}/auth/refresh`, {
    refreshToken,
  });
  tokenStorage.setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
};

// Rutas de auth donde un 401 NO significa "token vencido"
// (por ejemplo, contraseña incorrecta en el login)
const isAuthEndpoint = (url = "") =>
  ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].some((path) =>
    url.startsWith(path)
  );

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// 2) Después de cada respuesta: si es 401, renueva el token y repite la petición
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      original &&
      !original._retry && // solo un reintento por petición, para no hacer un bucle
      !isAuthEndpoint(original.url) &&
      tokenStorage.getRefreshToken() !== null; // sin sesión no hay nada que renovar

    if (!shouldRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      // El refresh token también venció o fue anulado: sesión expirada
      tokenStorage.clear();
      onSessionExpired?.();
      return Promise.reject(refreshError);
    }
  }
);
