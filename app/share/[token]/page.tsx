"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { ExternalLink, Copy, User, Sun, Moon, Calendar } from '@/components/icons'
import { PRItem } from '@/lib/types'

type ShareData = {
  title: string
  createdBy: string
  createdAt: string
  prs: PRItem[]
  accessCount: number
}

const statusOrder = ['initial', 'in_review', 'approved', 'merged', 'released']
const statusLabels = {
  initial: 'Initial',
  in_review: 'In Review',
  approved: 'Approved',
  merged: 'Merged',
  released: 'Released'
}

export default function SharePage() {
  const params = useParams()
  const token = params?.token as string
  const [data, setData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(true) // Default to dark mode

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    if (!token) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/share?token=${token}`)
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'Failed to fetch shared data')
        }
        
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared board')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const generateReport = () => {
    if (!data) return ''

    let report = `${data.title}'s PR Board Report\n`
    report += `${'='.repeat(data.title.length + 18)}\n\n`
    report += `Created by: ${data.createdBy}\n`
    report += `Generated: ${new Date(data.createdAt).toLocaleDateString()} at ${new Date(data.createdAt).toLocaleTimeString()}\n`
    report += `Total PRs: ${data.prs.length}\n\n`

    // Group PRs by status
    const prsByStatus = data.prs.reduce((acc, pr) => {
      if (!acc[pr.status]) acc[pr.status] = []
      acc[pr.status].push(pr)
      return acc
    }, {} as Record<string, PRItem[]>)

    // Generate report for each status
    statusOrder.forEach(status => {
      const prs = prsByStatus[status] || []
      if (prs.length === 0) return

      const statusLabel = statusLabels[status as keyof typeof statusLabels]
      report += `${statusLabel.toUpperCase()} (${prs.length})\n`
      report += `${'-'.repeat(statusLabel.length + prs.length.toString().length + 3)}\n`
      
      prs.forEach((pr, index) => {
        report += `\n${index + 1}. ${pr.title}\n`
        report += `   ${pr.category === 'project' ? 'Project' : 'Service'}: ${pr.category === 'project' ? pr.project : pr.service}\n`
        report += `   Author: ${pr.author}\n`
        report += `   Priority: ${pr.priority.toUpperCase()}\n`
        
        if (pr.description) {
          report += `   Description: ${pr.description}\n`
        }
        
        if (pr.links && pr.links.length > 0) {
          report += `   Links:\n`
          pr.links.forEach(link => {
            report += `     - ${link.label || 'Link'}: ${link.url}\n`
          })
        }
        
        report += '\n'
      })
    })

    return report
  }

  const copyReport = async () => {
    const report = generateReport()
    try {
      await navigator.clipboard.writeText(report)
      toast.success('Report copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy report')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            This link may have expired or been deactivated.
          </p>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Group PRs by status for display
  const prsByStatus = data.prs.reduce((acc, pr) => {
    if (!acc[pr.status]) acc[pr.status] = []
    acc[pr.status].push(pr)
    return acc
  }, {} as Record<string, PRItem[]>)

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`border-b px-4 py-6 ${isDarkMode ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.title}&apos;s PR Board</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shared Report</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className={`flex flex-wrap items-center gap-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Created by: {data.createdBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Generated: {new Date(data.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span>Total PRs: {data.prs.length}</span>
              </div>
              <div>
                <span>Views: {data.accessCount}</span>
              </div>
            </div>
            <button
              onClick={copyReport}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              <Copy className="w-4 h-4" />
              Copy Report
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {statusOrder.map(status => {
          const prs = prsByStatus[status] || []
          if (prs.length === 0) return null

          return (
            <div key={status} className="mb-8">
              <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className={`w-3 h-3 rounded-full ${
                  status === 'initial' ? 'bg-gray-400' :
                  status === 'in_review' ? 'bg-yellow-400' :
                  status === 'approved' ? 'bg-blue-400' :
                  status === 'merged' ? 'bg-green-400' :
                  'bg-purple-400'
                }`}></div>
                {statusLabels[status as keyof typeof statusLabels]} ({prs.length})
              </h2>
              
              <div className="space-y-4">
                {prs.map((pr, index) => (
                  <div key={pr.id} className={`p-4 border-l-4 rounded-lg ${isDarkMode ? 'bg-gray-800 border-l-blue-500 border border-gray-700' : 'bg-white border-l-blue-500 border border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pr.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pr.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        pr.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        pr.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {pr.priority}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {pr.category === 'project' ? 'Project:' : 'Service:'}
                        </span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {pr.category === 'project' ? pr.project : pr.service}
                        </span>
                      </div>
                      <div>
                        <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Author:</span>
                        <span className={`ml-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{pr.author}</span>
                      </div>
                    </div>
                    
                    {pr.description && (
                      <div className="mt-2">
                        <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description:</span>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pr.description}</p>
                      </div>
                    )}
                    
                    {pr.links && pr.links.length > 0 && (
                      <div className="mt-3">
                        <span className={`font-medium text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Links:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {pr.links.map((link, linkIndex) => (
                            <a
                              key={linkIndex}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors border ${
                                isDarkMode 
                                  ? 'bg-blue-900/30 text-blue-300 border-blue-700 hover:bg-blue-900/50 hover:text-blue-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800'
                              }`}
                            >
                              <ExternalLink className="w-3 h-3" />
                              {link.label || 'Link'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        
        {data.prs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">No PRs Found</h2>
            <p className="text-muted-foreground mb-4 text-center">This board doesn&apos;t have any PRs yet.</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 px-4 py-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>Generated by PR Tracker Dashboard</p>
          <p className="mt-1">This is a read-only view of the shared board.</p>
        </div>
      </footer>
    </div>
  )
}
