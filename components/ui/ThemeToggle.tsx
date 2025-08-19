"use client"

import { useTheme } from '@/lib/theme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className="btn" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="text-xs">{theme === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
    </button>
  )
}


