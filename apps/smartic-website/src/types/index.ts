// import type { User } from '@/stores/userStore'
import type { DrawProps } from "@smartic/types";


export interface RoomJoinedData {
  // user: User
  roomId: string;
  // members: User[]
}

export interface Notification {
  title: string;
  message: string;
}

export const roomStatus = {
  WAITING: "waiting",
  PLAYING: "playing",
  INTERVAL: "interval",
} as const;


export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}