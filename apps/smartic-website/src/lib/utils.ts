import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { RoomStatus, DrawOptions } from "@smartic/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function draw({
  ctx,
  currentPoint,
  prevPoint,
  strokeColor,
  strokeWidth,
  dashGap,
}: DrawOptions) {
  const startPoint = prevPoint ?? currentPoint;

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth[0];
  ctx.setLineDash(dashGap);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Start a new path
  ctx.beginPath();
  // Place the cursor from the point the line should be started
  ctx.moveTo(startPoint.x, startPoint.y);
  // Draw a line from current cursor position to the provided x,y coordinate
  ctx.lineTo(currentPoint.x, currentPoint.y);
  // Add stroke to the given path (render the line)
  ctx.stroke();
}

export function drawWithDataURL(
  dataURL: string,
  ctx: CanvasRenderingContext2D,
  canvasElement: HTMLCanvasElement
) {
  const img = new Image();
  img.src = dataURL;
  img.onload = () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.drawImage(img, 0, 0);
  };
}

export function isMacOS() {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent?.includes("Mac");
}

const statusToCountdown: Record<Exclude<RoomStatus, "waiting">, number> = {
  interval: 5,
  playing: 15,
};

export function countdownToProggressVal({
  countdown,
  roomStatus,
}: {
  countdown: number;
  roomStatus: RoomStatus;
}) {
  if (roomStatus === "waiting") return 0;

  return (100 / statusToCountdown[roomStatus]) * countdown;
}

export function copyToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}

export function isElementInViewport(element?: HTMLElement | null) {
  const rect = element?.getBoundingClientRect();

  return (
    rect &&
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
