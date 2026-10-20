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
import { RoomState } from "@/types/rooms";

interface RoomsContextValue {
  room: RoomState | null;
  loading: boolean;
  error: string | null;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
}

const RoomsContext = createContext<RoomsContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 2000;

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    let cancelled = false;

    const load = () => {
      api
        .get<RoomState>(`/rooms/${roomCode}`)
        .then(({ data }) => {
          if (cancelled) return;
          setRoom(data);
          setError(null);
        })
        .catch(() => {
          if (!cancelled) setError("Sala no encontrada o código inválido");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    load();
    const intervalId = setInterval(load, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [roomCode]);

  const joinRoom = useCallback((code: string) => {
    setLoading(true);
    setError(null);
    setRoom(null);
    setRoomCode(code);
  }, []);

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setRoom(null);
    setError(null);
  }, []);

  return (
    <RoomsContext.Provider
      value={{ room, loading, error, joinRoom, leaveRoom }}
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