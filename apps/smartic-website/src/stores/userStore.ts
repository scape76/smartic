import { create } from "zustand";
import { Player } from "@smartic/types";

interface UserState {
  user: Player | null;
  setUser: (user: Player) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
