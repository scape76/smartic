import { object, string, minLength, maxLength } from "valibot";

export const playerSchema = object({
  username: string([
    minLength(3, "Username must be at least 3 characters."),
    maxLength(31, "Username must not contain more than 31 characters"),
  ]),
  language: string(),
});
