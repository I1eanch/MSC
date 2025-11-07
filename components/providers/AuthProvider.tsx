'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, createContext, useContext, useState, ReactNode } from 'react'

interface User {
  id: string
  email: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const storedUser = localStorage.getItem('adminUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    // Redirect logic based on auth state and route
    if (!isLoading) {
      const isLoginPage = pathname === '/login'
      const isPublicRoute = pathname === '/' || isLoginPage

      if (!user && !isPublicRoute) {
        router.push('/login')
      } else if (user && isLoginPage) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call an API
    if (email === 'admin@example.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin'
      }
      setUser(adminUser)
      localStorage.setItem('adminUser', JSON.stringify(adminUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('adminUser')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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