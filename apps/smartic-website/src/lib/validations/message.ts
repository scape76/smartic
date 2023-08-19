import { object, string, maxLength } from "valibot";

export const messageSchema = object({
  text: string([maxLength(31, "Text is too long")]),
});
