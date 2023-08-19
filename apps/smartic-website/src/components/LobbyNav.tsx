"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteFriendsButton } from "./InviteFriendsButton";
import { useRoomStore } from "@/stores/roomStore";

interface LobbyNavProps {
  className: string;
  roomId: string;
}

const LobbyNav: React.FC<LobbyNavProps> = ({ className, roomId }) => {
  const players = useRoomStore((state) => state.players);

  return (
    <div
      className={cn(
        "fixed top-0 z-10 flex w-full flex-col border-r border-border lg:bottom-0 lg:z-auto lg:w-72 bg-background",
        className
      )}
    >
      <div className={"overflow-y-auto lg:static lg:block"}>
        <nav className="space-y-4 px-2 py-5">
          <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400/80">
            <div>Players</div>
          </div>

          {players.map((p) => {
            return (
              <div className="w-full" key={p.id}>
                <PlayerItem
                  key={p.id}
                  name={p.username}
                  color={p.color}
                  points={p.points}
                />
              </div>
            );
          })}
          <InviteFriendsButton roomId={roomId} />
        </nav>
      </div>
    </div>
  );
};

function PlayerItem({
  name,
  points,
  color,
}: {
  name: string;
  points: number;
  color: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex rounded-md px-3 py-2 text-sm font-medium hover:text-gray-300 cursor-pointer border border-border items-center gap-2 w-full">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="self-start" style={{ color }}>{name}</span>
          <span className="self-start text-muted-foreground">Points: {points}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
        <DropdownMenuItem>Team</DropdownMenuItem>
        <DropdownMenuItem>Subscription</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LobbyNav;
