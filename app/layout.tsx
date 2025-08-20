import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/lib/theme'
import { UserProvider } from '@/lib/UserContext'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'PR Tracker Dashboard',
  description: 'Track pull requests across projects on a Kanban board',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text min-h-screen transition-colors">
        <ThemeProvider>
          <UserProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


