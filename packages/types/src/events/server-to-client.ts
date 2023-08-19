import { ChatMessage, Notification, Player, Room, RoomStatus, DrawOptions } from "../index";

type RoomCreatedPayload = {
  user: Player;
  roomId: string;
  room: Room;
};

export type RoomStatusUpdatePayload = {
  status: RoomStatus;
  canvasMessage?: string;
  countdown?: number;
  drawingPlayer?: Player;
};

export type NewMessagePayload = Notification | ChatMessage;

export type PlayersUpdatePayload =
  | {
      player: Player;
      type: "join";
    }
  | { playerId: string; type: "leave" }
  | { type: "update"; players: Player[] };

export type CurrentMove = Room["currentMove"];

export interface ServerToClientEvents {
  "room-created": (payload: RoomCreatedPayload) => void;
  "players-update": (
    payload:
    PlayersUpdatePayload
  ) => void;
  "room-joined": (payload: RoomCreatedPayload) => void;
  "room-not-found": () => void;
  "client-loaded": () => void;
  "get-canvas-state": () => void;
  "canvas-state-from-server": (payload: { canvasState: string }) => void;
  "update-canvas-state": (payload: { drawOptions: DrawOptions }) => void;
  "last-undo-point-from-server": (payload: { lastUndoPoint?: string }) => void;
  "undo-canvas": (payload: { canvasState: string }) => void;
  "clear-canvas": () => void;
  "new-message": (payload: NewMessagePayload) => void;
  "room-status-update": (payload: RoomStatusUpdatePayload) => void;
  "current-move": (payload: { currentMove: CurrentMove }) => void;
}
