"use client";

import * as React from "react";

import { socket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import { useChatStore } from "@/stores/chatStore";
import { useRoomStore } from "@/stores/roomStore";
import { useNotiChatStore } from "@/stores/notiChatStore";

export function DisconnectUser({ roomId }: { roomId: string }) {
  const router = useRouter();

  const user = useUserStore((state) => state.user);

  const resetRoom = useRoomStore((state) => state.resetRoom);

  const clearMessages = useChatStore((state) => state.clearMessages);

  const clearNotifications = useNotiChatStore(
    (state) => state.clearNotifications
  );

  React.useEffect(() => {
    if (!user) router.push("/");
  }, [user]);

  React.useEffect(() => {
    const beforeUnloadListener = function () {
      clearMessages();
      resetRoom();
      clearNotifications();
      socket.emit("leave-room", { roomId, userId: user!.id });
      socket.removeAllListeners();
    };

    window.onbeforeunload = beforeUnloadListener;

    const onRoomNotFound = () => {
      router.push("/");
    }

    socket.on("room-not-found", onRoomNotFound);

    return () => {
      if (user) {
        beforeUnloadListener();
      }

      window.removeEventListener("beforeUnload", beforeUnloadListener);

      socket.removeListener("room-not-found", onRoomNotFound)
    };
  }, []);

  return <></>;
}
