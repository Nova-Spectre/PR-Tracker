"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null
      if (saved === 'light' || saved === 'dark') {
        setThemeState(saved)
        document.documentElement.classList.toggle('light', saved === 'light')
      } else {
        const prefersLight = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        const initial: Theme = prefersLight ? 'light' : 'dark'
        setThemeState(initial)
        document.documentElement.classList.toggle('light', initial === 'light')
      }
    } catch {}
  }, [])

  const setTheme = (t: Theme) => {
    setThemeState(t)
    try {
      if (typeof window !== 'undefined') localStorage.setItem('theme', t)
    } catch {}
    document.documentElement.classList.toggle('light', t === 'light')
  }

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}


