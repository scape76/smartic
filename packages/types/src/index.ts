export interface Player {
  username: string;
  color: string;
  id: string;
  points: number;
  isGuessing: boolean;
}

const roomStatus = {
  WAITING: "waiting",
  PLAYING: "playing",
  INTERVAL: "interval",
} as const;

export type RoomStatus = (typeof roomStatus)[keyof typeof roomStatus];

export interface Room {
  players: Player[];
  // playerId - word
  currentMove?: { player: Player; word: string };
  language: string;
  undoPoints: string[];
  status: RoomStatus;
  canvasMessage?: string;
  countdown?: number;
}

export type RoomFrontend = Omit<Room, "undoPoints"> & {
  drawingPlayer?: Player;
};

export type Notification = {
  type: "join" | "leave";
  user: Omit<Player, "id" | "isGuessing" | "points">;
  message: string;
  id: string;
};

export type ChatMessage = (
  | {
      type: "chat-message";
      body: string;
      user: Player;
    }
  | {
      type: "answer";
      body: string;
      user?: Player;
    }
) & { id: string };

export interface Point {
  x: number
  y: number
}

export interface DrawProps {
  ctx: CanvasRenderingContext2D
  currentPoint: Point
  prevPoint: Point | undefined
}

export interface DrawOptions extends DrawProps {
  strokeColor: string;
  strokeWidth: number[];
  dashGap: number[];
}


interface SendCanvasStatePayload {
  canvasState: string;
  roomId: string;
}

export interface ClientToServerEvents {
  "create-room": (payload: { username: string; language: string }) => void;
  "join-room": (payload: { username: string; roomId: string }) => void;
  "leave-room": (payload: { roomId: string; userId: string }) => void;
  "client-ready": (payload: { roomId: string }) => void;
  "send-canvas-state": (payload: SendCanvasStatePayload) => void;
  draw: (payload: { drawOptions: DrawOptions; roomId: string }) => void;
  undo: (payload: SendCanvasStatePayload) => void;
  "delete-last-undo-point": (payload: { roomId: string }) => void;
  "get-last-undo-point": (payload: { roomId: string }) => void;
  "add-undo-point": (payload: { roomId: string; undoPoint: string }) => void;
  "clear-canvas": (payload: { roomId: string }) => void;
  "send-message": (payload: { text: string; roomId: string }) => void;
}

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
