import type { User } from '@/types/Types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserStoreTypes {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

const useUserStore = create<UserStoreTypes>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    },
  ),
)

export default useUserStore
