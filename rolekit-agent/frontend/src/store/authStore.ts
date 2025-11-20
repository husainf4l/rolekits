import { create } from 'zustand'

interface AuthUser {
  id: string
  name: string
  email: string
  avatar_url?: string
  subscription_type?: 'free' | 'pro' | 'enterprise'
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  setToken: (token: string | null) => void
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('auth_token'),
  user: null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
    set({ token })
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null })
  },
}))

