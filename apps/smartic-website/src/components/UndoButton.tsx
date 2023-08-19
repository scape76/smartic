"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { ImSpinner9 as Spinner } from "react-icons/im";

import { socket } from "@/lib/socket";
import { cn, isMacOS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { kbd as Kbd } from "@/components/ui/kbd";

interface UndoButtonProps {
  undo: (lastUndoPoint: string) => void;
  roomId: string;
}

export default function UndoButton({ undo, roomId }: UndoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const isMac = isMacOS();
  const hotKey = `${isMac ? "Meta" : "ctrl"} + z`;

  const undoCanvas = () => {
    setIsLoading(true);
    socket.emit("get-last-undo-point", { roomId });
  };

  useHotkeys(hotKey, undoCanvas);

  useEffect(() => {
    // This socket does undo function
    const onLastUndoPoint = ({ lastUndoPoint }: { lastUndoPoint?: string }) => {
      if (!lastUndoPoint) return void setIsLoading(false);

      undo(lastUndoPoint);
      socket.emit("undo", {
        canvasState: lastUndoPoint,
        roomId,
      });

      socket.emit("delete-last-undo-point", { roomId });
      setIsLoading(false);
    };

    socket.on("last-undo-point-from-server", onLastUndoPoint);

    return () => {
      socket.off("last-undo-point-from-server", onLastUndoPoint);
    };
  }, [roomId, undo]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            className="w-16 rounded-none rounded-bl-md border-0 border-b border-l p-0 focus-within:z-10"
            disabled={isLoading}
            onClick={undoCanvas}
          >
            {isLoading ? <Spinner className="h-4 w-4 animate-spin" /> : "Undo"}
          </Button>
        </TooltipTrigger>

        <TooltipContent className="flex gap-1">
          <Kbd className={cn({ "text-xs": isMac })}>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>Z</Kbd>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
