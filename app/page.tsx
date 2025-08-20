"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Board from '@/components/board/Board'
import { STORAGE_KEY, defaultColumns, emptyDataSet, loadData, saveData } from '@/lib/data'
import type { DataSet } from '@/lib/types'
import { Plus, LogOut, Settings } from '@/components/icons'
import PRModal from '@/components/pr/PRModal'
import WorkspaceTabs from '@/components/workspaces/WorkspaceTabs'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useUser } from '@/lib/UserContext'
import StableThreeBackground from '@/components/ui/StableThreeBackground'

export default function HomePage() {
  const { user, loading, logout } = useUser()
  const router = useRouter()
  const [workspace, setWorkspace] = useState<string>('All Projects')
  const [category, setCategory] = useState<'all' | 'project' | 'service'>('all')
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'service'>('none')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [data, setData] = useState<DataSet>(emptyDataSet)

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  // Bootstrap data: load user-specific PRs from DB
  useEffect(() => {
    if (!user || typeof window === 'undefined') return
    
    const loadUserData = async () => {
      try {
        console.log('[ui] bootstrap: loading user PRs from DB')
        const res = await fetch('/api/prs')
        if (res.ok) {
          const { prs } = await res.json()
          if (Array.isArray(prs)) {
            const next: DataSet = { columns: defaultColumns, prs, projects: [], services: [] }
            saveData(next)
            setData(next)
            if (prs.length > 0) {
              toast.success(`Loaded ${prs.length} PRs from your dashboard`)
            }
            return
          }
        } else if (res.status === 401) {
          // Authentication expired, redirect to login
          router.push('/auth')
          return
        }
        console.log('[ui] bootstrap: no user PRs, starting with empty board')
        const seeded: DataSet = { ...emptyDataSet, columns: defaultColumns }
        saveData(seeded)
        setData(seeded)
      } catch (e) {
        console.error('[ui] bootstrap error', e)
        // Ensure UI still works with defaults
        const seeded: DataSet = { ...emptyDataSet, columns: defaultColumns }
        saveData(seeded)
        setData(seeded)
      }
    }
    
    loadUserData()
  }, [user, router])

  const filteredPRs = useMemo(() => {
    let filtered = data.prs
    if (workspace !== 'All Projects') {
      filtered = filtered.filter((pr) => pr.project === workspace)
    }
    if (category !== 'all') {
      filtered = filtered.filter((pr) => pr.category === category)
    }
    return filtered
  }, [data.prs, workspace, category])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white mb-2">Loading PR Tracker</h2>
          <p className="text-gray-300">Checking your authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  const allWorkspaces = ['All Projects', ...(data.projects ?? []).map(p => p.name), ...(data.services ?? []).map(s => s.name)]

  return (
    <div className="min-h-screen bg-background text-text flex flex-col relative">
      <StableThreeBackground intensity="low" objectCount={6} />
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 relative z-10">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl font-semibold">PR Tracker</h1>
          <div className="flex items-center gap-2 sm:hidden">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add PR
          </button>
          <ThemeToggle />
        </div>
        
        {/* User Info and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex-1 sm:flex-none px-2 py-1 border border-border rounded-md bg-card text-text text-xs sm:text-sm min-w-0"
              >
                <option value="all">All</option>
                <option value="project">Projects</option>
                <option value="service">Services</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap">Group by:</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="flex-1 sm:flex-none px-2 py-1 border border-border rounded-md bg-card text-text text-xs sm:text-sm min-w-0"
              >
                <option value="none">None</option>
                <option value="project">Project</option>
                <option value="service">Service</option>
              </select>
            </div>
          </div>
          <WorkspaceTabs
            workspaces={allWorkspaces}
            active={workspace}
            onChange={setWorkspace}
          />
          {/* User Profile Section */}
          <div className="flex items-center gap-2 sm:gap-3 sm:ml-4 sm:pl-4 sm:border-l border-border mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs sm:text-sm hidden sm:block">
                <div className="font-medium">{user.name}</div>
                <div className="text-muted-foreground text-xs">{user.email}</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 sm:py-6 flex-1 relative z-10">
        <Board
          initialColumns={data.columns}
          prs={filteredPRs}
          filterProject={workspace === 'All Projects' ? undefined : workspace}
          groupBy={groupBy}
          onChange={(updated) => {
            saveData(updated)
            setData(updated)
            toast.success('Board updated')
          }}
        />
      </main>

      <PRModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (pr) => {
          try {
            console.log('[ui] creating PR via API', pr)
            const res = await fetch('/api/prs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pr),
            })
            if (!res.ok) throw new Error(`API error ${res.status}`)
            const { pr: created } = await res.json()
            console.log('[ui] created PR', created)

            const current = data
            const next: DataSet = { ...current, prs: [created, ...current.prs] }
            saveData(next)
            setData(next)
            toast.success('PR added (DB)')
          } catch (e) {
            console.error('[ui] create PR failed, falling back to local', e)
            const current = data
            const next: DataSet = { ...current, prs: [pr, ...current.prs] }
            saveData(next)
            setData(next)
            toast.error('DB unavailable, saved locally')
          }
        }}
      />
      
      {/* Settings Icon - Bottom Right */}
      <button
        onClick={() => window.location.href = '/settings'}
        className="fixed bottom-4 right-4 z-20 w-12 h-12 bg-card/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200 shadow-lg hover:shadow-xl"
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  )
}


