import { Socket } from "socket.io";
import { CreateRoomData, JoinRoomData } from "../../types";
import {
  object,
  string,
  custom,
  minLength,
  maxLength,
  safeParse,
  enumType,
} from "valibot";

export const joinRoomSchema = object({
  username: string([
    minLength(3, "Username must be at least 4 characters."),
    maxLength(31, "Username must not contain more than 31 characters"),
  ]),
  roomId: string([
    custom(
      (value) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          value
        ),
      "Invalid UUID format for roomId"
    ),
  ]),
});

export const createRoomSchema = object({
  username: string([
    minLength(3, "Username must be at least 4 characters."),
    maxLength(31, "Username must not contain more than 31 characters"),
  ]),
  language: enumType(["english"]),
});

export function validateJoinRoomData(
  socket: Socket,
  joinRoomData: JoinRoomData
) {
  const result = safeParse(joinRoomSchema, joinRoomData);
  if (result.success) {
    return result.data;
  } else {
    // socket.emit("invalid-data", {
    //   message:
    //     "The entities you provided are not correct and cannot be processed.",
    // });
  }
}

export function validateCreateRoomData(
  socket: Socket,
  createRoomData: CreateRoomData
) {
  const result = safeParse(createRoomSchema, createRoomData);
  if (result.success) {
    return result.data;
  } else {
    // socket.emit("invalid-data", {
    //   message:
    //     "The entities you provided are not correct and cannot be processed.",
    // });
  }
}
