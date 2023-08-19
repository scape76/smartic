import { DrawOptions } from "../index";

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
