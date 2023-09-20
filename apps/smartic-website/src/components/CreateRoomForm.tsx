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
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socket";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Input as InferInput } from "valibot";
import { useUserStore } from "@/stores/userStore";
import { createRoomSchema } from "@/lib/validations/room";
import { useRoomStore } from "@/stores/roomStore";
import randomstring from "randomstring";
import { getRandomPlayerNumber } from "@/lib/utils";

type Inputs = InferInput<typeof createRoomSchema>;

export function CreateRoomForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const setUser = useUserStore((state) => state.setUser);
  const setRoom = useRoomStore((state) => state.setRoom);

  const randomPlayerNumber = getRandomPlayerNumber();

  const form = useForm<Inputs>({
    resolver: valibotResolver(createRoomSchema),
    defaultValues: {
      username: `Player${randomPlayerNumber}`,
      language: "english",

    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: Inputs) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    setIsLoading(true);
    socket.emit("create-room", { ...values });
  }

  useEffect(() => {
    socket.once("room-created", ({ user, roomId, room }) => {
      setUser(user);
      setRoom(room);

      router.push(`/${roomId}`);
    });

    // return () => {
    //   socket.removeListener("room-created");
    // };
  }, []);

  return (
    <>
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
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pointsThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => {
                      if (!/^\d+$/.test(e.target.value) && e.target.value) return;
                      field.onChange(e);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full">
            {isLoading && <ImSpinner9 className="w-4 h-4 mr-2 animate-spin" />}
            Play
          </Button>
        </form>
      </Form>
    </>
  );
}
