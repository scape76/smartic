import { Player, Room } from "@smartic/types";
import { roomStatus } from "../types";
import { rooms, activeGameloops } from "../data/store";
import { START_GAME_PLAYERS_AMOUNT } from "../config";
import * as words from "../../words.json";
import { Server, Socket } from "socket.io";
import { refreshCanvas, startGameloop } from "../main";

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
    | ({ status: (typeof roomStatus)["INTERVAL"] } & {
        drawingPlayerUsername: string;
        previousWord?: string;
      })
    | { status: (typeof roomStatus)["WAITING" | "PLAYING"] }
) {
  switch (payload.status) {
    case "interval":
      return `${
        payload.previousWord ? `It was ${payload.previousWord}.` : ""
      }\n${payload.drawingPlayerUsername} is about to draw now!`;
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

export function getRandomWord(language: keyof typeof words) {
  return words[language][Math.floor(Math.random() * words[language].length)];
}

export function getNextMove(roomId: string): Room["currentMove"] {
  const room = rooms.get(roomId);

  if (!room) {
    console.warn("Room not found");
    return;
  }

  const newWord = getRandomWord(room.language);

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

// export function getUpdatedRoom(
//   props: {
//     roomId: string;
//   } & (
//     | {
//         user: Player;
//         type: "joined";
//       }
//     | {
//         userId: string;
//         type: "leave";
//       }
//   )
// ) {
//   const room = rooms.get(props.roomId);

//   if (!room) return null;

//   let updatedRoom = {
//     ...room,
//     players:
//       props.type === "joined"
//         ? [...room.players, props.user]
//         : room.players.filter((p) => p.id !== props.userId),
//   };

//   if (
//     room.status === roomStatus.WAITING &&
//     updatedRoom.players.length >= START_GAME_PLAYERS_AMOUNT
//   ) {
//     updatedRoom = {
//       ...updatedRoom,
//       status: roomStatus.INTERVAL,
//     };
//   } else if (
//     room.status !== roomStatus.WAITING &&
//     updatedRoom.players.length === 1
//   ) {
//     updatedRoom = {
//       ...updatedRoom,
//       undoPoints: [],
//       status: roomStatus.WAITING,
//       currentMove: undefined,
//       canvasMessage: getCanvasMessage({ status: roomStatus.WAITING }),
//     };
//   }

//   rooms.set(props.roomId, updatedRoom);

//   return updatedRoom;
// }

export function handleUserJoinRoom({
  roomId,
  username,
  socket,
}: {
  roomId: string;
  username: string;
  socket: Socket;
}) {
  const room = rooms.get(roomId);

  if (!room) return socket.emit("room-not-found");

  socket.join(roomId);

  const user = {
    id: socket.id,
    username,
    color: getRandomColor(),
    isGuessing: true,
    points: 0,
  };

  let updatedRoom = {
    ...room,
    players: [...room.players, user],
  };

  if (
    room.status === roomStatus.WAITING &&
    updatedRoom.players.length >= START_GAME_PLAYERS_AMOUNT
  ) {
    updatedRoom = {
      ...updatedRoom,
      status: roomStatus.INTERVAL,
    };
  }

  rooms.set(roomId, {
    ...updatedRoom,
  });

  socket.emit("room-joined", { user, roomId, room: updatedRoom });
  socket.to(roomId).emit("players-update", { player: user, type: "join" });
  socket.to(roomId).emit("new-message", {
    type: "join",
    user,
    message: `has joined us!`,
    id: `${user.id}-join`,
  });

  if (updatedRoom.status === "interval" && !activeGameloops.has(roomId)) {
    startGameloop(roomId, roomStatus.INTERVAL);
  }
}

export function handleUserLeaveRoom({
  roomId,
  player,
  socket,
}: {
  roomId: string;
  player: Player;
  socket: Socket;
}) {
  const room = rooms.get(roomId);

  if (!room) return null;

  let updatedRoom = {
    ...room,
    players: room.players.filter((p) => p.id !== player.id),
  };

  if (!updatedRoom.players.length) {
    return rooms.delete(roomId);
  }

  if (room.status !== roomStatus.WAITING && updatedRoom.players.length === 1) {
    updatedRoom = {
      ...updatedRoom,
      undoPoints: [],
      status: roomStatus.WAITING,
      currentMove: undefined,
      canvasMessage: getCanvasMessage({ status: roomStatus.WAITING }),
    };

    socket.to(roomId).emit("room-status-update", {
      status: updatedRoom.status,
      canvasMessage: updatedRoom.canvasMessage,
    });

    refreshCanvas(roomId);
  }

  socket
    .to(roomId)
    .emit("players-update", { playerId: player.id, type: "leave" });

  socket.to(roomId).emit("new-message", {
    type: "leave",
    user: {
      username: player.username,
      color: player.color,
    },
    message: `has left the room!`,
    id: `${player.id}-leave`,
  });

  rooms.set(roomId, updatedRoom);

  if (room.currentMove?.player.id === socket.id) {
    refreshCanvas(roomId);
  }
}

export function updateToNextMove(roomId: string, io: Server) {
  const room = rooms.get(roomId);

  if (!room) return;

  const nextMove = getNextMove(roomId);

  if (!nextMove) return;

  const canvasMessage = getCanvasMessage({
    status: roomStatus.INTERVAL,
    drawingPlayerUsername: nextMove.player.username,
    previousWord: room.currentMove?.word,
  });

  let updatedRoom = {
    ...room,
    status: roomStatus.INTERVAL,
    currentMove: nextMove,
    canvasMessage,
    players: room.players.map((p) =>
      p.id === nextMove.player.id
        ? { ...p, isGuessing: false }
        : { ...p, isGuessing: true }
    ),
  };

  rooms.set(roomId, updatedRoom);

  io.to(updatedRoom.currentMove.player.id).emit("current-move", {
    currentMove: updatedRoom.currentMove,
  });

  io.to(roomId).emit("players-update", {
    type: "update",
    players: updatedRoom.players,
  });

  io.to(roomId).emit("room-status-update", {
    status: updatedRoom.status,
    canvasMessage: updatedRoom.canvasMessage,
    countdown: updatedRoom.countdown,
    drawingPlayer: updatedRoom.currentMove?.player,
  });

  return updatedRoom;
}
