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
import { getErrorMessage } from "@/lib/errors";
import { CreateRoomData, RoomState } from "@/types/rooms";

interface RoomsContextValue {
  room: RoomState | null;
  // Momento en que llegó el último estado: sirve para descontar los segundos
  // en pantalla entre una actualización y la siguiente
  receivedAt: number;
  error: string | null;
  joining: boolean;
  creating: boolean;
  starting: boolean;
  joinRoom: (code: string) => Promise<boolean>;
  createRoom: (data: CreateRoomData) => Promise<boolean>;
  startRoom: () => Promise<void>;
  leaveRoom: () => void;
}

const RoomsContext = createContext<RoomsContextValue | undefined>(undefined);

// Mientras llegan los sockets (Etapa 6), la sala se actualiza preguntando cada 2 s
const POLL_INTERVAL_MS = 2000;

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [receivedAt, setReceivedAt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);

  // Guarda un estado nuevo de la sala junto con la hora en que llegó
  const applyRoom = useCallback((data: RoomState) => {
    setRoom(data);
    setReceivedAt(Date.now());
    setError(null);
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    let cancelled = false;

    // Función intermedia async: el efecto no puede ser async, pero esta sí
    const refreshRoom = async () => {
      try {
        const { data } = await api.get<RoomState>(`/rooms/${roomCode}`);
        if (!cancelled) applyRoom(data);
      } catch (error) {
        if (cancelled) return;
        const message = getErrorMessage(error, "No se pudo actualizar la sala");
        setError(message);
        // El id evita que el sondeo apile un toast nuevo en cada intento
        toast.error(message, { id: "room-error" });
      }
    };

    const intervalId = setInterval(refreshRoom, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [roomCode, applyRoom]);

  // Revisa que la sala exista ANTES de navegar: si el código está mal,
  // el usuario se queda en la pantalla de inicio con un aviso
  const joinRoom = useCallback(
    async (code: string) => {
      setJoining(true);
      try {
        const { data } = await api.get<RoomState>(`/rooms/${code}`);
        applyRoom(data);
        setRoomCode(code);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo entrar a la sala"));
        return false;
      } finally {
        setJoining(false);
      }
    },
    [applyRoom]
  );

  const createRoom = useCallback(
    async (data: CreateRoomData) => {
      setCreating(true);
      try {
        const { data: created } = await api.post<RoomState>("/rooms", data);
        applyRoom(created);
        setRoomCode(created.code);
        toast.success(`Sala creada · código ${created.code}`);
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo crear la votación"));
        return false;
      } finally {
        setCreating(false);
      }
    },
    [applyRoom]
  );

  const startRoom = useCallback(async () => {
    if (!roomCode) return;
    setStarting(true);
    try {
      const { data } = await api.post<RoomState>(`/rooms/${roomCode}/start`);
      applyRoom(data);
      toast.success("¡Votación iniciada!");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo iniciar la votación"));
    } finally {
      setStarting(false);
    }
  }, [roomCode, applyRoom]);

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setError(null);
  }, []);

  return (
    <RoomsContext.Provider
      value={{
        room,
        receivedAt,
        error,
        joining,
        creating,
        starting,
        joinRoom,
        createRoom,
        startRoom,
        leaveRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomsContext);
  if (!context) {
    throw new Error("useRooms debe usarse dentro de RoomsProvider");
  }
  return context;
}
