"use client";

import { useChatStore } from "@/stores/chatStore";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "./ui/card";
import { useNotiChatStore } from "@/stores/notiChatStore";
import type { Notification } from "@smartic/types";
import { cn } from "@/lib/utils";

export function NotiChat() {
  const [movedCursor, setMovedCursor] = React.useState(false);
  const [sawNewNotis, setSawNewNotis] = React.useState(true);

  const notifications = useNotiChatStore((state) => state.notifications);

  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToLastMessage = React.useCallback(() => {
    if (!scrollAreaRef.current || !lastMessageRef.current?.offsetTop) return;
    scrollAreaRef.current.scrollTo({
      top: lastMessageRef.current.offsetTop,
      behavior: "smooth",
    });
    setSawNewNotis(true);
    setMovedCursor(false);
  }, [scrollAreaRef, lastMessageRef]);

  React.useEffect(() => {
    if (movedCursor) {
      setSawNewNotis(false);
      return;
    }
    scrollToLastMessage();
  }, [notifications]);

  React.useEffect(() => {
    if (!scrollAreaRef.current || !lastMessageRef.current) return;

    const diff =
      scrollAreaRef.current?.clientHeight -
      lastMessageRef.current?.clientHeight;

    const callbackListener = () => {
      if (
        scrollAreaRef.current?.scrollTop ===
        Number(lastMessageRef.current?.offsetTop) - diff
      ) {
        scrollToLastMessage();
        return;
      }

      setMovedCursor(true);
    };

    scrollAreaRef.current.addEventListener("scrollend", callbackListener);

    return () => {
      scrollAreaRef.current?.removeEventListener("scrollend", callbackListener);
    };

  }, [scrollAreaRef, lastMessageRef.current]);

  return (
    <Card
      id="chat"
      className="w-full md:w-[270px]  h-[13rem] mt-4 mx-6 p-4 border-border border"
    >
      <div
        className="relative  h-[11rem] overflow-auto scrollbar-w-2 scrollbar-track-blue-lighter scrollbar-thumb-blue scrollbar-thumb-rounded"
        ref={scrollAreaRef}
      >
        {notifications.map((n, i) => {
          if (notifications.length - 1 === i) {
            return (
              <div ref={lastMessageRef} key={n.id}>
                <NotificationMessage {...n} />
              </div>
            );
          }
          return <NotificationMessage {...n} key={n.id} />;
        })}
      </div>
    </Card>
  );
}

function NotificationMessage({ user, message, type }: Notification) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="self-start" style={{ color: user.color }}>
        {user.username}
      </span>
      <span
        className={cn({
          "text-destructive": type === "leave",
          "text-success": type === "join",
        })}
      >
        {message}
      </span>
    </div>
  );
}
