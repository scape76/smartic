"use client";

import * as React from "react";
import * as z from "zod";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { ImSpinner9 } from "react-icons/im";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { playerSchema } from "@/lib/validations/player";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Input as InferInput } from "valibot";
import type { Player, Room } from "@smartic/types";
import { useUserStore } from "@/stores/userStore";
import { messageSchema } from "@/lib/validations/message";
import { useRoomStore } from "@/stores/roomStore";

type Inputs = InferInput<typeof messageSchema>;

export function NewMessageForm({
  roomId,
  onMessage,
}: {
  roomId: string;
  onMessage: () => void;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const user = useUserStore((store) => store.user);
  const players = useRoomStore((store) => store.players);

  const canGuess = players.find((p) => p.id === user?.id)?.isGuessing;

  const form = useForm<Inputs>({
    resolver: valibotResolver(messageSchema),
    defaultValues: {
      text: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: Inputs) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (!user || !values.text) return;
    setIsLoading(true);
    socket.emit("send-message", { ...values, roomId });
    form.reset();
    onMessage();
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form className="mt-2 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  disabled={isLoading || !canGuess}
                  placeholder="Type an answer here..."
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      form.handleSubmit(onSubmit);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
