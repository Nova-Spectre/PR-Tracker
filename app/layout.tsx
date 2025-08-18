import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PR Tracker Dashboard',
  description: 'Track pull requests across projects on a Kanban board',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text min-h-screen">
        {children}
      </body>
    </html>
  )
}


