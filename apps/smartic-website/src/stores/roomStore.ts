import { create } from "zustand";
import {
  Player,
  RoomStatusUpdatePayload,
  CurrentMove,
  RoomFrontend,
} from "@smartic/types";

interface RoomState extends RoomFrontend {
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setPlayers: (players: Player[]) => void;
  setRoom: (room: RoomFrontend) => void;
  updateRoomStatus: ({
    status,
    countdown,
    canvasMessage,
  }: RoomStatusUpdatePayload) => void;
  resetRoom: () => void;
  setCurrentMove: (currentMove: CurrentMove) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  language: "english",
  status: "waiting",
  canvasMessage: "",
  countdown: 0,
  players: [],
  currentMove: undefined,
  drawingPlayer: undefined,
  setRoom: (room) => set((state) => ({ ...state, ...room })),
  addPlayer: (player) =>
    set((state) => ({ players: [...state.players, player] })),
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),
  setPlayers: (players) => set((state) => ({ players })),
  updateRoomStatus: ({ status, canvasMessage, countdown, drawingPlayer }) =>
    set((state) => ({
      status,
      canvasMessage,
      countdown: countdown,
      drawingPlayer,
    })),
  resetRoom: () =>
    set({
      language: "english",
      status: "waiting",
      canvasMessage: "",
      countdown: 0,
      players: [],
      drawingPlayer: undefined,
    }),
  setCurrentMove: (currentMove) => set({ currentMove }),
}));
