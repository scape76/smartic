import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@smartic/types";

const SERVER =
  process.env.NODE_ENV === "development" ? "localhost:3001" : process.env.NEXT_PUBLIC_WSS_URL!;

console.log(process.env.NODE_ENV)

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  SERVER,
  { transports: ["websocket"] }
);
