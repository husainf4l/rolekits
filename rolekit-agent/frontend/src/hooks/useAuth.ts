import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'

export const useAuth = () => {
  const { token, user, setToken, setUser, logout } = useAuthStore()

  const login = useCallback(
    (nextToken: string, nextUser: typeof user) => {
      setToken(nextToken)
      setUser(nextUser ?? null)
    },
    [setToken, setUser, user],
  )

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }
}

