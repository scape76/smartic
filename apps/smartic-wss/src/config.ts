import { RoomStatus } from "@smartic/types";

export const statusToCountdown: Record<
  Exclude<RoomStatus, "waiting">,
  number
> = {
  interval: 8,
  playing: 60,
};

export const START_GAME_PLAYERS_AMOUNT = 2;

export const POINTS_FOR_GUESS = 5;
export const POINTS_FOR_GUESS_TO_PAINTER = 2;
