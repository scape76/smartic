"use client";

import useDraw from "@/hooks/useDraw";
import { socket } from "@/lib/socket";
import { draw, drawWithDataURL } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvasStore";
import { useUserStore } from "@/stores/userStore";
import * as React from "react";
import UndoButton from "./UndoButton";
import ClearButton from "./ClearButton";
import { DrawOptions, DrawProps } from "@smartic/types";
import { useRoomStore } from "@/stores/roomStore";
import { ProgressTracker } from "./ProgressTracker";
import ColorPicker from "./ColorPicker";

interface DrawingCanvasProps {
  roomId: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ roomId }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isCanvasLoading, setIsCanvasLoading] = React.useState(true);

  const strokeColor = useCanvasStore((state) => state.strokeColor);
  const strokeWidth = useCanvasStore((state) => state.strokeWidth);
  const dashGap = useCanvasStore((state) => state.dashGap);
  const { user } = useUserStore((state) => state);

  const room = useRoomStore((state) => state);

  const canDraw =
    room.status === "playing" && room.drawingPlayer?.id === user?.id;

  const onDraw = React.useCallback(
    ({ ctx, currentPoint, prevPoint }: DrawProps) => {
      const drawOptions = {
        ctx,
        currentPoint,
        prevPoint,
        strokeColor,
        strokeWidth,
        dashGap,
      };
      if (!canDraw) return;
      draw(drawOptions);
      socket.emit("draw", { drawOptions, roomId });
    },
    [strokeColor, strokeWidth, dashGap, canDraw]
  );

  const { canvasRef, onInteractStart, clear, undo } = useDraw(onDraw);

  React.useEffect(() => {
    const canvasElement = canvasRef.current;
    const ctx = canvasElement?.getContext("2d");

    const onClientLoaded = () => {
      setIsCanvasLoading(false);
    };

    socket.emit("client-ready", { roomId });

    socket.on("client-loaded", onClientLoaded);

    const onGetCanvasState = () => {
      const canvasState = canvasRef.current?.toDataURL();
      if (!canvasState) return;

      socket.emit("send-canvas-state", { canvasState, roomId });
    };

    socket.on("get-canvas-state", onGetCanvasState);

    const onCanvasStateFromServer = ({
      canvasState,
    }: {
      canvasState: string;
    }) => {
      if (!ctx || !canvasElement) return;

      drawWithDataURL(canvasState, ctx, canvasElement);
      setIsCanvasLoading(false);
    };

    socket.on("canvas-state-from-server", onCanvasStateFromServer);

    const onUpdateCanvasState = ({
      drawOptions,
    }: {
      drawOptions: DrawOptions;
    }) => {
      if (!ctx) return;
      draw({ ...drawOptions, ctx });
    };

    socket.on("update-canvas-state", onUpdateCanvasState);

    const onUndoCanvas = ({ canvasState }: { canvasState: string }) => {
      if (!ctx || !canvasElement) return;

      drawWithDataURL(canvasState, ctx, canvasElement);
    };

    socket.on("undo-canvas", onUndoCanvas);

    socket.on("clear-canvas", clear);

    return () => {
      socket.removeListener("clear-canvas", clear);
      socket.removeListener("undo-canvas", onUndoCanvas);
      socket.removeListener("update-canvas-state", onUpdateCanvasState);
      socket.removeListener(
        "canvas-state-from-server",
        onCanvasStateFromServer
      );
      socket.removeListener("get-canvas-state", onGetCanvasState);
      socket.removeListener("client-loaded", onClientLoaded);
    };
  }, [clear]);

  React.useEffect(() => {
    const setCanvasDimensions = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const { width, height } = containerRef.current?.getBoundingClientRect();

      canvasRef.current.width = width - 50;
      canvasRef.current.height = height;
    };

    setCanvasDimensions();
    setIsCanvasLoading(false);
  }, [canvasRef]);

  const handleInteractStart = () => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    socket.emit("add-undo-point", {
      roomId,
      undoPoint: canvasElement.toDataURL(),
    });

    onInteractStart();
  };

  return (
    <div
      ref={containerRef}
      className="flex relative aspect-[1.712] w-full max-w-[720px] md:mx-0 items-center justify-center mt-6"
    >
      {!isCanvasLoading && canDraw && (
        <div className="absolute right-[25px] top-[0] flex select-none rounded-none rounded-bl rounded-tr-[2.5px]">
          <UndoButton undo={undo} roomId={roomId} />

          <ClearButton roomId={roomId} canvasRef={canvasRef} clear={clear} />
        </div>
      )}

      <canvas
        id="canvas"
        ref={canvasRef}
        onMouseDown={canDraw ? handleInteractStart : undefined}
        onTouchStart={canDraw ? handleInteractStart : undefined}
        className="touch-none rounded border bg-white"
      />
      {room.canvasMessage && (
        <span className="absolute top-50 left-50 text-background animate-pulse select-none">
          {room.canvasMessage}
        </span>
      )}
      {canDraw && room.currentMove?.word && (
        <>
          <div className="absolute left-6 top-0">
            <ColorPicker />
          </div>
          <span className="absolute -top-4 left-50 p-2 select-none bg-primary text-primary-foreground rounded-md">
            {room.currentMove?.word}
          </span>
        </>
      )}
      {["playing", "interval"].includes(room.status) && (
        <div className="absolute bottom-0 w-[calc(100%-50px)]">
          <ProgressTracker />
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
