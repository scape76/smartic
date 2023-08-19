import * as React from "react";
import type { Metadata } from "next/types";
import { cn } from "@/lib/utils";
import LobbyNav from "@/components/LobbyNav";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import DrawingCanvas from "@/components/DrawingCanvas";
import { RoomTracker } from "@/components/RoomTracker";
import { Chat } from "@/components/Chat";
import { NotiChat } from "@/components/NotiChat";
import { DisconnectUser } from "@/components/DisconnectUser";
import { siteConfig } from "@/config/site";
import { RxHamburgerMenu } from "react-icons/rx";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: `${siteConfig.name} room`,
  description: siteConfig.description,
};

interface RoomPageProps {
  params: {
    roomId: string;
  };
}

const RoomPage: React.FC<RoomPageProps> = ({ params: { roomId } }) => {
  return (
    <div>
      <DisconnectUser roomId={roomId} />
      <RoomTracker roomId={roomId} />
      <div className="lg:hidden">
        <Sheet>
          <div className="w-full px-6 py-2 bg-background flex items-center justify-between">
            <SheetTrigger>
              <RxHamburgerMenu className="h-8 w-8" />
            </SheetTrigger>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={"/favicon.ico"}
                width={32}
                height={32}
                alt={"smartic"}
              />
              Smartic
            </Link>
          </div>
          <SheetContent side={"left"}>
            <LobbyNav
              roomId={roomId}
              className="block relative w-full border-none mt-4"
            />
          </SheetContent>
        </Sheet>
      </div>
      <LobbyNav roomId={roomId} className="hidden lg:block" />
      <div className="lg:pl-72 flex flex-col items-center">
        <DrawingCanvas roomId={roomId} />
        <div className="flex flex-col md:flex-row items-center gap-4 ">
          <Chat roomId={roomId} />
          <NotiChat />
        </div>
      </div>
    </div>
  );
};

export default RoomPage;
