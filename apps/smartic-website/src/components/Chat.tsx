"use client";

import { useChatStore } from "@/stores/chatStore";
import * as React from "react";
import { Card } from "./ui/card";
import { NewMessageForm } from "./NewMessageForm";
import { ChatMessage } from "@smartic/types";
import { cn } from "@/lib/utils";
import { AiOutlineArrowDown } from "react-icons/ai";
import { Button } from "./ui/button";
import { useUserStore } from "@/stores/userStore";

export function Chat({ roomId }: { roomId: string }) {
  const [movedCursor, setMovedCursor] = React.useState(false);
  const [sawNewMessages, setSawNewMessages] = React.useState(true);

  const { messages } = useChatStore((state) => state);

  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  const scrollToLastMessage = React.useCallback(() => {
    if (!scrollAreaRef.current || !lastMessageRef.current?.offsetTop) return;
    scrollAreaRef.current.scrollTo({
      top: lastMessageRef.current.offsetTop,
      behavior: "smooth",
    });
    setSawNewMessages(true);
    setMovedCursor(false);
  }, [scrollAreaRef, lastMessageRef]);

  React.useEffect(() => {
    if (movedCursor) {
      setSawNewMessages(false);
      return;
    }
    scrollToLastMessage();
  }, [messages]);

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
        setSawNewMessages(true);
        setMovedCursor(false);
        return;
      }

      setMovedCursor(true);
    };

    scrollAreaRef.current.addEventListener("scrollend", callbackListener);

    return () => {
      scrollAreaRef.current?.removeEventListener("scrollend", callbackListener);
    };
  }, [scrollAreaRef, messages]);

  console.log(movedCursor, sawNewMessages);

  return (
    <Card className="w-full md:w-[270px]  mt-4 mx-6 p-4 border-border border ">
      {/* <ScrollArea className="relative h-[8rem]"> */}
      <div className="relative">
        <div
          className="relative h-[8rem] overflow-auto scrollbar-w-2 scrollbar-track-blue-lighter scrollbar-thumb-blue scrollbar-thumb-rounded"
          ref={scrollAreaRef}
        >
          {messages.map((m, i) => {
            if (messages.length - 1 === i) {
              return (
                <div ref={lastMessageRef} key={m.id}>
                  <ChatMessage {...m} />
                </div>
              );
            }
            return <ChatMessage {...m} key={m.id} />;
          })}
        </div>
        {!sawNewMessages && movedCursor && (
          <Button
            variant={"outline"}
            className="absolute w-4rem flex items-center left-[calc(50%-4.2rem)] bottom-4 p-2 rounded-sm bg-white/15 "
            onClick={() => {
              scrollToLastMessage();
            }}
          >
            <AiOutlineArrowDown className="mr-2" />
            New messages
          </Button>
        )}
      </div>
      {/* </ScrollArea> */}
      <NewMessageForm roomId={roomId} onMessage={scrollToLastMessage} />
    </Card>
  );
}

function ChatMessage({ type, body, user }: ChatMessage) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {user && (
        <span className="self-start" style={{ color: user.color }}>
          {user.username}
        </span>
      )}
      <span
        className={cn("text-muted-foreground", {
          "text-primary": type === "answer",
        })}
      >
        {body}
      </span>
    </div>
  );
}
