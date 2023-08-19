import { Notification } from "@smartic/types";
import { create } from "zustand";

interface NotiChatState {
  notifications: Notification[];
  addNotification: (message: Notification) => void;
  clearNotifications: () => void;
}

export const useNotiChatStore = create<NotiChatState>((set) => ({
  notifications: [],
  addNotification: (noti) =>
    set((state) => ({ notifications: [...state.notifications, noti] })),
  clearNotifications: () => set((_) => ({ notifications: [] })),
}));
