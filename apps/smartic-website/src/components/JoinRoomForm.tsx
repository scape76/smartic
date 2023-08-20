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
import { joinRoomSchema } from "@/lib/validations/room";
import { useRoomStore } from "@/stores/roomStore";
import { getRandomPlayerNumber } from "@/lib/utils";

type Inputs = InferInput<typeof joinRoomSchema>;

export function JoinRoomForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const setUser = useUserStore((state) => state.setUser);
  const setRoom = useRoomStore((state) => state.setRoom);

  const randomPlayerNumber = getRandomPlayerNumber();

  const form = useForm<Inputs>({
    resolver: valibotResolver(joinRoomSchema),
    defaultValues: {
      username: `Player${randomPlayerNumber}`,
      roomId: "",
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: Inputs) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true);
    socket.emit("join-room", { ...values });
  }

  useEffect(() => {
    socket.once("room-joined", ({ user, roomId, room }) => {
      setUser(user);
      setRoom(room);

      router.push(`/${roomId}`);
    });
  }, []);

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="roomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room id</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full">
          {isLoading && <ImSpinner9 className="w-4 h-4 mr-2 animate-spin" />}
          Join
        </Button>
      </form>
    </Form>
  );
}
