import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        surface: '#111827',
        muted: '#1f2937',
        border: '#374151',
        text: '#e5e7eb',
        accent: '#60a5fa',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
      }
    }
  },
  plugins: []
} satisfies Config


