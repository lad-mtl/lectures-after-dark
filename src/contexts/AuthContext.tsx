/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'admin_authenticated'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored === 'true'
  })

  const login = (password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

    if (password === adminPassword) {
      setIsAuthenticated(true)
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      return true
    }

    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
