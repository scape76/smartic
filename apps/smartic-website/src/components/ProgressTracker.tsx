"use client";

import * as React from "react";

import { useRoomStore } from "@/stores/roomStore";
import { Progress } from "@/components/ui/progress";
import { countdownToProggressVal } from "@/lib/utils";

export function ProgressTracker() {
  // const countdown = useRoomStore((state) => state.countdown);
  const { countdown, status } = useRoomStore((state) => state);

  return (
    <Progress
      value={countdownToProggressVal({ countdown: countdown ?? 0, roomStatus: status })}
      className="w-full rounded-xs"
    />
  );
}
