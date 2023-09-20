export * from "./events/server-to-client";
export * from "./events/client-to-server";

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

const language = {
  english: "English",
} as const;

export type Language = keyof typeof language;

export interface Room {
  players: Player[];
  currentMove?: { player: Player; word: string };
  language: Language;
  undoPoints: string[];
  status: RoomStatus;
  canvasMessage?: string;
  countdown?: number;
  pointsThreshold: number;
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
  x: number;
  y: number;
}

export interface DrawProps {
  ctx: CanvasRenderingContext2D;
  currentPoint: Point;
  prevPoint: Point | undefined;
}

export interface DrawOptions extends DrawProps {
  strokeColor: string;
  strokeWidth: number[];
  dashGap: number[];
}

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
