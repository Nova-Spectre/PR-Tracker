"use client"

import { useEffect, useMemo, useState } from 'react'
import Board from '@/components/board/Board'
import { defaultColumns, emptyDataSet, loadData, saveData } from '@/lib/data'
import { Plus, Settings } from '@/components/icons'
import PRModal from '@/components/pr/PRModal'
import WorkspaceTabs from '@/components/workspaces/WorkspaceTabs'
import toast, { Toaster } from 'react-hot-toast'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function HomePage() {
  const [workspace, setWorkspace] = useState<string>('All Projects')
  const [category, setCategory] = useState<'all' | 'project' | 'service'>('all')
  const [groupBy, setGroupBy] = useState<'none' | 'project' | 'service'>('none')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  const { columns, prs, projects, services } = useMemo(() => loadData(), [dataVersion])

  // Bootstrap data: if local data is missing, try loading from DB; fallback to defaults
  useEffect(() => {
    if (typeof window === 'undefined') return
    const existing = localStorage.getItem('pr-tracker-data')
    if (existing) return
    ;(async () => {
      try {
        console.log('[ui] bootstrap: attempting to load PRs from DB')
        const res = await fetch('/api/prs')
        if (res.ok) {
          const { prs } = await res.json()
          if (Array.isArray(prs) && prs.length > 0) {
            saveData({ columns: defaultColumns, prs, projects: [], services: [] })
            setDataVersion((v) => v + 1)
            toast.success('Loaded PRs from database')
            return
          }
        }
        console.log('[ui] bootstrap: no DB PRs, seeding defaults')
        saveData({ ...emptyDataSet, columns: defaultColumns })
        setDataVersion((v) => v + 1)
      } catch (e) {
        console.error('[ui] bootstrap error', e)
        // Ensure UI still works with defaults
        saveData({ ...emptyDataSet, columns: defaultColumns })
        setDataVersion((v) => v + 1)
      }
    })()
  }, [])

  const filteredPRs = useMemo(() => {
    let filtered = prs
    if (workspace !== 'All Projects') {
      filtered = filtered.filter(p => 
        (p.category === 'project' && p.project === workspace) ||
        (p.category === 'service' && p.service === workspace)
      )
    }
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }
    return filtered
  }, [prs, workspace, category])

  const allWorkspaces = ['All Projects', ...(projects ?? []).map(p => p.name), ...(services ?? []).map(s => s.name)]

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">PR Tracker Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a href="/settings" className="btn">
              <Settings className="w-4 h-4" />
              Settings
            </a>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add PR
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium">Category:</span>
            <div className="flex gap-2">
              {(['all', 'project', 'service'] as const).map((cat) => (
                <button
                  key={cat}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    category === cat ? 'bg-accent/20 border-accent/40' : 'bg-muted border-border hover:bg-border'
                  }`}
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <span className="text-sm font-medium">Group by:</span>
            <div className="flex gap-2">
              {(['none', 'project', 'service'] as const).map((g) => (
                <button
                  key={g}
                  className={`px-3 py-1.5 rounded-md border text-sm ${
                    groupBy === g ? 'bg-accent/20 border-accent/40' : 'bg-muted border-border hover:bg-border'
                  }`}
                  onClick={() => setGroupBy(g)}
                >
                  {g === 'none' ? 'None' : g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <WorkspaceTabs
            workspaces={allWorkspaces}
            active={workspace}
            onChange={setWorkspace}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        <Board
          initialColumns={columns}
          prs={filteredPRs}
          filterProject={workspace === 'All Projects' ? undefined : workspace}
          groupBy={groupBy}
          onChange={(updated) => {
            saveData(updated)
            setDataVersion((v) => v + 1)
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

            const current = loadData()
            const next = { ...current, prs: [created, ...current.prs] }
            saveData(next)
            setDataVersion((v) => v + 1)
            toast.success('PR added (DB)')
          } catch (e) {
            console.error('[ui] create PR failed, falling back to local', e)
            const current = loadData()
            const next = { ...current, prs: [pr, ...current.prs] }
            saveData(next)
            setDataVersion((v) => v + 1)
            toast.error('DB unavailable, saved locally')
          }
        }}
      />
    </div>
  )
}


