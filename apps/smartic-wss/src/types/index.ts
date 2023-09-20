export interface JoinRoomData {
  roomId: string;
  username: string;
}

export interface CreateRoomData {
  username: string;
  language: string;
  pointsThreshold: number;
}

export const roomStatus = {
  WAITING: "waiting",
  PLAYING: "playing",
  INTERVAL: "interval",
} as const;
