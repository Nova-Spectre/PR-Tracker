"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    theme: string
    emailNotifications: boolean
    calendarIntegration: boolean
  }
}

interface UserContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success(data.message)
        return true
      } else {
        toast.error(data.error || 'Login failed')
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Something went wrong. Please try again.')
      return false
    }
  }

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          name,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        toast.success(data.message)
        return true
      } else {
        toast.error(data.error || 'Signup failed')
        return false
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Something went wrong. Please try again.')
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
      })
      setUser(null)
      toast.success('Logged out successfully')
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const refreshUser = async () => {
    await checkAuth()
  }

  const value: UserContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    refreshUser,
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useUser()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        router.push('/auth')
      }
    }, [user, loading, router])

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}
