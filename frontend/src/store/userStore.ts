import { create } from "zustand";
import { User } from "../types/Types";
import { persist } from "zustand/middleware";

interface UserTypes {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserTypes>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-storage",
    },
  ),
);

export default useUserStore;
