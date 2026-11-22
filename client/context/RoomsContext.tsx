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
import { ROOM_EVENTS, roomChannel, supabase } from "@/lib/supabase";
import { CreateRoomData, RoomState, RoomStatus } from "@/types/rooms";

interface RoomsContextValue {
  room: RoomState | null;
  receivedAt: number;
  live: boolean;
  joining: boolean;
  creating: boolean;
  starting: boolean;
  votingFor: number | null;
  joinRoom: (code: string) => Promise<boolean>;
  createRoom: (data: CreateRoomData) => Promise<string | null>;
  startRoom: () => Promise<void>;
  vote: (mascotId: number) => Promise<boolean>;
  leaveRoom: () => void;
}

const RoomsContext = createContext<RoomsContextValue | undefined>(undefined);

const SAFETY_RESYNC_MS = 15000;

const STATUS_ORDER: Record<RoomStatus, number> = { waiting: 0, live: 1, finished: 2 };

const isOutdated = (current: RoomState | null, next: RoomState): boolean => {
  if (!current || current.code !== next.code) return false;
  if (STATUS_ORDER[next.status] < STATUS_ORDER[current.status]) return true;
  return next.status === current.status && next.totalVotes < current.totalVotes;
};

const resultMessage = (room: RoomState): string => {
  if (room.isTie) return "¡Votación cerrada: empate!";
  const winner = room.contenders.find((c) => c.mascot.id === room.winnerMascotId);
  return `¡Votación cerrada: ganó ${winner?.mascot.name}!`;
};

interface Snapshot {
  room: RoomState;
  receivedAt: number;
}

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [live, setLive] = useState(false);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [votingFor, setVotingFor] = useState<number | null>(null);

  const applyRoom = useCallback((next: RoomState) => {
    setSnapshot((current) => {
      if (isOutdated(current?.room ?? null, next)) return current;
      const sameRoom = current?.room.code === next.code;
      const myVoteMascotId =
        next.myVoteMascotId ?? (sameRoom ? current.room.myVoteMascotId : null);
      return { room: { ...next, myVoteMascotId }, receivedAt: Date.now() };
    });
  }, []);

  const fetchRoom = useCallback(
    async (code: string) => {
      try {
        const { data } = await api.get<RoomState>(`/rooms/${code}`);
        applyRoom(data);
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo actualizar la sala"), {
          id: "room-error",
        });
      }
    },
    [applyRoom]
  );

  useEffect(() => {
    if (!roomCode) return;
    const channel = supabase.channel(roomChannel(roomCode));

    ROOM_EVENTS.forEach((event) => {
      channel.on("broadcast", { event }, ({ payload }) => {
        const next = payload as RoomState;
        applyRoom(next);
        if (event === "room_finished") {
          toast.success(resultMessage(next), { id: "room-finished" });
          fetchRoom(roomCode);
        }
      });
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setLive(true);
        fetchRoom(roomCode);
      } else {
        setLive(false);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomCode, applyRoom, fetchRoom]);

  useEffect(() => {
    if (!roomCode) return;
    const intervalId = setInterval(() => fetchRoom(roomCode), SAFETY_RESYNC_MS);
    return () => clearInterval(intervalId);
  }, [roomCode, fetchRoom]);

  const status = snapshot?.room.status;
  const secondsRemaining = snapshot?.room.secondsRemaining;
  const receivedAt = snapshot?.receivedAt;
  useEffect(() => {
    if (!roomCode || status !== "live" || secondsRemaining === undefined || !receivedAt) {
      return;
    }
    const msLeft = secondsRemaining * 1000 - (Date.now() - receivedAt);
    const timeoutId = setTimeout(() => fetchRoom(roomCode), Math.max(0, msLeft) + 500);
    return () => clearTimeout(timeoutId);
  }, [roomCode, status, secondsRemaining, receivedAt, fetchRoom]);

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
        return created.code;
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo crear la votación"));
        return null;
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

  const vote = useCallback(
    async (mascotId: number) => {
      if (!roomCode) return false;
      setVotingFor(mascotId);
      try {
        const { data } = await api.post<RoomState>(`/rooms/${roomCode}/votes`, {
          mascotId,
        });
        applyRoom(data);
        toast.success("¡Voto registrado! +50 XP");
        return true;
      } catch (error) {
        toast.error(getErrorMessage(error, "No se pudo registrar tu voto"));
        return false;
      } finally {
        setVotingFor(null);
      }
    },
    [roomCode, applyRoom]
  );

  const leaveRoom = useCallback(() => {
    setRoomCode(null);
    setSnapshot(null);
    setLive(false);
  }, []);

  return (
    <RoomsContext.Provider
      value={{
        room: snapshot?.room ?? null,
        receivedAt: snapshot?.receivedAt ?? 0,
        live,
        joining,
        creating,
        starting,
        votingFor,
        joinRoom,
        createRoom,
        startRoom,
        vote,
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
