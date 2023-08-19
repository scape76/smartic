"use client";

import { socket } from "@/lib/socket";
import { useChatStore } from "@/stores/chatStore";
import { useNotiChatStore } from "@/stores/notiChatStore";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import {
  NewMessagePayload,
  PlayersUpdatePayload,
  CurrentMove,
  RoomStatusUpdatePayload,
} from "@smartic/types";
import * as React from "react";

export function RoomTracker({ roomId }: { roomId: string }) {
  const {
    addPlayer,
    removePlayer,
    setPlayers,
    updateRoomStatus,
    setCurrentMove,
  } = useRoomStore((state) => state);
  const { addMessage } = useChatStore();
  const { addNotification } = useNotiChatStore();

  React.useEffect(() => {
    const onPlayersUpdate = (payload: PlayersUpdatePayload) => {
      switch (payload.type) {
        case "join":
          addPlayer(payload.player);
          break;
        case "leave":
          removePlayer(payload.playerId);
          break;
        case "update":
          setPlayers(payload.players);
        default:
          return;
      }
    };

    socket.on("players-update", onPlayersUpdate);

    const onNewMessage = (payload: NewMessagePayload) => {
      if (payload.type === "chat-message" || payload.type === "answer") {
        addMessage(payload);
      } else if (payload.type === "join" || payload.type === "leave") {
        addNotification(payload);
      }
    };

    socket.on("new-message", onNewMessage);

    const onCurrentMove = ({ currentMove }: { currentMove: CurrentMove }) => {
      setCurrentMove(currentMove);
    };

    socket.on("current-move", onCurrentMove);

    const onRoomStatusUpdate = (payload: RoomStatusUpdatePayload) => {
      updateRoomStatus({
        ...payload,
        canvasMessage: payload.canvasMessage ?? "",
      });
    };

    socket.on("room-status-update", onRoomStatusUpdate);

    return () => {
      socket.off("current-move", onCurrentMove);
      socket.off("room-status-update", onRoomStatusUpdate);
      socket.off("players-update", onPlayersUpdate);
    };
  }, [roomId]);

  return <></>;
}
