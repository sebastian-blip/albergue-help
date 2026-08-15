import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCurrentUser, login as loginApi, removeToken, storeToken } from '../services/auth'
import type { User } from '../types/user'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  sessionExpired: boolean
  clearSessionExpired: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch((error) => {
        if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
          setSessionExpired(true)
        }
        removeToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const response = await loginApi({ email, password })
    storeToken(response.access_token)
    const currentUser = await getCurrentUser()
    setUser(currentUser)
    setSessionExpired(false)
  }

  const handleLogout = () => {
    removeToken()
    setUser(null)
  }

  const clearSessionExpired = () => {
    setSessionExpired(false)
  }

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: handleLogin,
    logout: handleLogout,
    sessionExpired,
    clearSessionExpired,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
