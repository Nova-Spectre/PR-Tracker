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
import ShareButton from '@/components/ui/ShareButton'

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
        console.log('[ui] bootstrap: loading user data from DB')
        
        // Load PRs and workspaces in parallel
        const [prsRes, workspacesRes] = await Promise.all([
          fetch('/api/prs'),
          fetch('/api/workspaces')
        ])
        
        // Handle authentication errors
        if (prsRes.status === 401 || workspacesRes.status === 401) {
          router.push('/auth')
          return
        }
        
        // Load PRs
        let prs: any[] = []
        if (prsRes.ok) {
          const prsData = await prsRes.json()
          if (Array.isArray(prsData.prs)) {
            prs = prsData.prs
          }
        }
        
        // Load workspaces (projects and services)
        let projects: any[] = []
        let services: any[] = []
        if (workspacesRes.ok) {
          const workspacesData = await workspacesRes.json()
          if (Array.isArray(workspacesData.items)) {
            projects = workspacesData.items.filter((item: any) => item.type === 'project')
            services = workspacesData.items.filter((item: any) => item.type === 'service')
          }
        }
        
        const next: DataSet = { columns: defaultColumns, prs, projects, services }
        saveData(next)
        setData(next)
        
        if (prs.length > 0 || projects.length > 0 || services.length > 0) {
          toast.success(`Loaded ${prs.length} PRs, ${projects.length} projects, ${services.length} services`)
        } else {
          console.log('[ui] bootstrap: no user data, starting with empty board')
        }
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

  // Generate workspace filters from existing data (must be before early returns)
  const projectWorkspaces = useMemo(() => {
    const configuredProjects = (data.projects ?? []).map(p => p.name).filter((name): name is string => Boolean(name))
    const usedProjects = [...new Set(data.prs.filter(pr => pr.category === 'project' && pr.project).map(pr => pr.project).filter((project): project is string => Boolean(project)))]
    return [...new Set([...configuredProjects, ...usedProjects])].sort()
  }, [data.projects, data.prs])

  const serviceWorkspaces = useMemo(() => {
    const configuredServices = (data.services ?? []).map(s => s.name).filter((name): name is string => Boolean(name))
    const usedServices = [...new Set(data.prs.filter(pr => pr.category === 'service' && pr.service).map(pr => pr.service).filter((service): service is string => Boolean(service)))]
    return [...new Set([...configuredServices, ...usedServices])].sort()
  }, [data.services, data.prs])

  const filteredPRs = useMemo(() => {
    let filtered = data.prs
    
    // Filter by workspace (project or service)
    if (workspace !== 'All Projects') {
      filtered = filtered.filter((pr) => {
        if (projectWorkspaces.includes(workspace)) {
          return pr.category === 'project' && pr.project === workspace
        }
        if (serviceWorkspaces.includes(workspace)) {
          return pr.category === 'service' && pr.service === workspace
        }
        return false
      })
    }
    
    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter((pr) => pr.category === category)
    }
    
    return filtered
  }, [data.prs, workspace, category, projectWorkspaces, serviceWorkspaces])

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

  const allWorkspaces: string[] = ['All Projects', ...projectWorkspaces, ...serviceWorkspaces]

  return (
    <div className="min-h-screen bg-background text-text flex flex-col relative">
      <StableThreeBackground intensity="low" objectCount={6} />
      <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
        {/* Top Row: Title and Controls */}
        <div className="px-2 sm:px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold">PR Tracker</h1>
          
          {/* Mobile Controls */}
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
          
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add PR
            </button>
            <ShareButton />
            <ThemeToggle />
          </div>
        </div>
        
        {/* Filters and Workspace Selection Row */}
        <div className="px-2 sm:px-4 py-2 border-t border-border/50 bg-card/40">
          <div className="flex flex-col gap-3">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium whitespace-nowrap text-muted-foreground">Category:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="px-2 py-1 border border-border rounded-md bg-card text-text text-xs sm:text-sm min-w-[80px]"
                >
                  <option value="all">All</option>
                  <option value="project">Projects</option>
                  <option value="service">Services</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium whitespace-nowrap text-muted-foreground">Group by:</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                  className="px-2 py-1 border border-border rounded-md bg-card text-text text-xs sm:text-sm min-w-[80px]"
                >
                  <option value="none">None</option>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                </select>
              </div>
            </div>
            
            {/* Workspace Selection Row - Horizontally Scrollable */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Workspaces:</span>
              <div className="flex-1 min-w-0">
                <WorkspaceTabs
                  workspaces={allWorkspaces}
                  active={workspace}
                  onChange={setWorkspace}
                  projectWorkspaces={projectWorkspaces}
                  serviceWorkspaces={serviceWorkspaces}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="px-2 sm:px-4 py-2 border-t border-border/50 bg-card/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-xs sm:text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground text-xs hidden sm:block">{user.email}</div>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 px-2 py-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors text-xs sm:text-sm"
              title="Logout"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
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


