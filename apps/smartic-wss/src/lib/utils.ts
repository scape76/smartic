import { Player, Room } from "@smartic/types";
import { roomStatus } from "../types";
import {
  rooms,
  activeGameloops,
  START_GAME_PLAYERS_AMOUNT,
} from "../data/store";
import { words } from "../data/store";

export function getRoomPlayers(roomId: string) {
  const room = rooms.get(roomId);

  return room?.players;
}

export function getPlayerById(roomId: string, playerId: string) {
  const room = getRoomPlayers(roomId);

  return room?.find((p) => p.id === playerId);
}

export function getCanvasMessage(
  payload:
    | { status: (typeof roomStatus)["INTERVAL"]; drawingPlayerUsername: string }
    | { status: (typeof roomStatus)["WAITING" | "PLAYING"] }
) {
  switch (payload.status) {
    case "interval":
      return `${payload.drawingPlayerUsername} is about to draw now!`;
    case "waiting":
      return "Waiting for players...";
    default:
      return "";
  }
}

export function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

export function getNextMove(roomId: string): Room["currentMove"] {
  const room = rooms.get(roomId);

  if (!room) {
    console.warn("Room not found");
    return;
  }

  const newWord = getRandomWord();

  const currentDrawingPlayerIndex = room.players.findIndex(
    (p) => p.id === room.currentMove?.player.id
  );

  // If there is no such
  if (currentDrawingPlayerIndex === -1) {
    const drawingPlayer = room.players[0];

    return { player: drawingPlayer, word: newWord };
  }

  const nextDrawingPlayerIndex =
    currentDrawingPlayerIndex + 1 === room.players.length
      ? 0
      : currentDrawingPlayerIndex + 1;

  return { player: room.players[nextDrawingPlayerIndex], word: newWord };
}

export function getUpdatedRoom(
  props: {
    roomId: string;
  } & (
    | {
        user: Player;
        type: "joined";
      }
    | {
        userId: string;
        type: "leave";
      }
  )
) {
  const room = rooms.get(props.roomId);

  if (!room) return null;

  let updatedRoom = {
    ...room,
    players:
      props.type === "joined"
        ? [...room.players, props.user]
        : room.players.filter((p) => p.id !== props.userId),
  };

  if (
    room.status === roomStatus.WAITING &&
    updatedRoom.players.length >= START_GAME_PLAYERS_AMOUNT
  ) {
    return {
      ...updatedRoom,
      status: roomStatus.INTERVAL,
    };
  } else if (
    room.status !== roomStatus.WAITING &&
    updatedRoom.players.length === 1
  ) {
    return {
      ...updatedRoom,
      undoPoints: [],
      status: roomStatus.WAITING,
      currentMove: undefined,
      canvasMessage: getCanvasMessage({ status: roomStatus.WAITING }),
    };
  }

  return updatedRoom;
}