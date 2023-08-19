import { object, string, minLength, maxLength, custom } from "valibot";

export const createRoomSchema = object({
  username: string([
    minLength(3, "Username must be at least 4 characters."),
    maxLength(31, "Username must not contain more than 31 characters"),
  ]),
  language: string(),
});


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

