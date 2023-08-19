export interface JoinRoomData {
  roomId: string;
  username: string;
}

export interface CreateRoomData {
  username: string;
  language: string;
}

export const roomStatus = {
  WAITING: "waiting",
  PLAYING: "playing",
  INTERVAL: "interval",
} as const;
