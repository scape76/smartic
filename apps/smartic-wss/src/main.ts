import { randomUUID } from "crypto";
import express from "express";

const app = express();

import http from "http";
const server = http.createServer(app);

// import type { Socket } from "@gartic/types";
import { Server } from "socket.io";
import {
  validateCreateRoomData,
  validateJoinRoomData,
} from "./lib/validations/room";
import type {
  Room,
  RoomStatus,
  ClientToServerEvents,
  ServerToClientEvents,
} from "@smartic/types";
import { roomStatus } from "./types";
import { activeGameloops, rooms } from "./data/store";
import {
  getCanvasMessage,
  getPlayerById,
  getRandomColor,
  updateToNextMove,
  getRoomPlayers,
  handleUserLeaveRoom,
  handleUserJoinRoom,
} from "./lib/utils";
import {
  statusToCountdown,
  POINTS_FOR_GUESS,
  POINTS_FOR_GUESS_TO_PAINTER,
  START_GAME_PLAYERS_AMOUNT,
} from "./config";

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

export function refreshCanvas(roomId: string) {
  const room = rooms.get(roomId);

  if (!room) return;

  rooms.set(roomId, {
    ...room,
    undoPoints: [],
  });

  io.to(roomId).emit("clear-canvas");
}

export function startGameloop(roomId: string, status: RoomStatus) {
  const room = rooms.get(roomId);

  console.log("new game loop started");

  if (!room) return;

  if (!room.currentMove) {
    updateToNextMove(roomId, io);
  }

  const countdownPromise = new Promise<void>((resolve, reject) => {
    let countdown = 0;

    const interval = setInterval(() => {
      activeGameloops.set(roomId, countdownPromise);
      const room = rooms.get(roomId);

      if (!room) {
        activeGameloops.delete(roomId);
        clearInterval(interval);
        reject();
        return;
      }

      if (room.status !== status || room.status === roomStatus.WAITING) {
        activeGameloops.delete(roomId);
        clearInterval(interval);
        resolve();
        return;
      }

      io.to(roomId).emit("room-status-update", {
        status: room.status,
        drawingPlayer: room.currentMove?.player,
        countdown,
        canvasMessage: room.canvasMessage,
      });

      countdown++;

      if (countdown === statusToCountdown[room.status]) {
        const nextRoomStatus =
          room.status === roomStatus.INTERVAL
            ? roomStatus.PLAYING
            : roomStatus.INTERVAL;

        if (nextRoomStatus === roomStatus.INTERVAL) {
          updateToNextMove(roomId, io);
        } else {
          const updatedRoom = {
            ...room,
            status: nextRoomStatus,
            canvasMessage: getCanvasMessage({
              status: nextRoomStatus,
            }),
          };
          rooms.set(roomId, updatedRoom);

          io.to(roomId).emit("room-status-update", {
            status: updatedRoom.status,
            canvasMessage: updatedRoom.canvasMessage,
            countdown: updatedRoom.countdown,
            drawingPlayer: updatedRoom.currentMove?.player,
          });
        }

        refreshCanvas(roomId);

        startGameloop(roomId, nextRoomStatus);
      }
    }, 1000);
  })
    .finally(() => activeGameloops.delete(roomId))
    .catch((err) => {
      io.to(roomId).emit("room-not-found");
      return;
    });
}

io.on("connection", (socket) => {
  socket.on("create-room", (data) => {
    const validatedData = validateCreateRoomData(socket, data);

    if (!validatedData) return;
    const { username, language } = validatedData;

    const roomId = randomUUID();

    const user = {
      id: socket.id,
      username,
      color: getRandomColor(),
      isGuessing: true,
      points: 0,
    };

    const room: Room = {
      players: [user],
      language,
      undoPoints: [],
      status: roomStatus.WAITING,
      canvasMessage: getCanvasMessage({ status: roomStatus.WAITING }),
      pointsThreshold: data.pointsThreshold,
    };

    rooms.set(roomId, room);

    socket.join(roomId);

    socket.emit("room-created", { user, roomId, room });
  });

  socket.on("join-room", (data) => {
    const validatedData = validateJoinRoomData(socket, data);

    if (!validatedData) return;

    const { username, roomId } = validatedData;

    handleUserJoinRoom({ roomId, username, socket });
  });

  socket.on("leave-room", ({ roomId }) => {
    // TODO: Parse input
    const player = getPlayerById(roomId, socket.id);

    if (!player) return;

    handleUserLeaveRoom({ roomId, player, socket });
  });

  socket.on("client-ready", ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) return socket.emit("room-not-found");

    if (room.players.length === 1) return socket.emit("client-loaded");

    // TODO: Choose a new drawing player
    if (!room.currentMove) return;

    socket.to(room.currentMove.player.id).emit("get-canvas-state");
  });

  socket.on("send-canvas-state", ({ canvasState, roomId }) => {
    const players = getRoomPlayers(roomId);
    const lastPlayer = players?.[players?.length - 1];

    if (!lastPlayer) return;

    socket.to(lastPlayer.id).emit("canvas-state-from-server", { canvasState });
  });

  socket.on("draw", ({ drawOptions, roomId }) => {
    const room = rooms.get(roomId);
    const canDraw =
      socket.id === room?.currentMove?.player?.id &&
      room.status === roomStatus.PLAYING;
    if (!canDraw) return;
    socket.to(roomId).emit("update-canvas-state", { drawOptions });
  });

  socket.on(
    "add-undo-point",
    ({ roomId, undoPoint }: { roomId: string; undoPoint: string }) => {
      const room = rooms.get(roomId);

      if (!room) return;

      const updatedRoom = {
        ...room,
        undoPoints: [...room.undoPoints, undoPoint],
      };

      rooms.set(roomId, updatedRoom);
    }
  );

  socket.on("undo", ({ canvasState, roomId }) => {
    socket.to(roomId).emit("undo-canvas", { canvasState });
  });

  socket.on("get-last-undo-point", ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      return;
    }

    const lastUndoPoint = room.undoPoints[room.undoPoints.length - 1];
    socket.emit("last-undo-point-from-server", { lastUndoPoint });
  });

  socket.on("delete-last-undo-point", ({ roomId }) => {
    const room = rooms.get(roomId);

    if (!room) return;

    const updatedRoom = {
      ...room,
      undoPoints: room.undoPoints.slice(0, -1),
    };

    rooms.set(roomId, updatedRoom);
  });

  socket.on("clear-canvas", ({ roomId }) => {
    socket.to(roomId).emit("clear-canvas");
  });

  socket.on("send-message", ({ roomId, text }) => {
    const room = rooms.get(roomId);

    if (!room) return;

    const author = getPlayerById(roomId, socket.id);

    if (!author?.isGuessing) return;

    const id = randomUUID();

    const guessedRight =
      text === room.currentMove?.word && room.status === roomStatus.PLAYING;

    if (guessedRight) {
      let updatedRoom = {
        ...room,
        players: room.players.map((p) =>
          p.id === author.id
            ? { ...p, isGuessing: false, points: p.points + POINTS_FOR_GUESS }
            : p.id === room.currentMove?.player.id
            ? {
                ...p,
                isGuessing: false,
                points: p.points + POINTS_FOR_GUESS_TO_PAINTER,
              }
            : p
        ),
      };

      rooms.set(roomId, updatedRoom);

      socket.to(roomId).emit("new-message", {
        type: "answer",
        body: "has hit the shot!",
        user: author,
        id,
      });

      io.to(author.id).emit("new-message", {
        type: "answer",
        body: "You guessed it right! it was " + room.currentMove?.word,
        id,
      });

      if (updatedRoom.players.some((p) => p.points >= room.pointsThreshold))
        if (!updatedRoom.players.some((p) => p.isGuessing)) {
          activeGameloops.delete(roomId);

          const updatedRoom = updateToNextMove(roomId, io);

          refreshCanvas(roomId);

          startGameloop(roomId, updatedRoom.status);

          return;
        }

      io.to(roomId).emit("players-update", {
        type: "update",
        players: updatedRoom.players,
      });

      return;
    }

    io.to(roomId).emit("new-message", {
      type: "chat-message",
      body: text,
      user: author,
      id,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening on *:${PORT}`);
});

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
  console.log("Up and running");
});
