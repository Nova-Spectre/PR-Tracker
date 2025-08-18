"use client"

import { useEffect, useMemo, useState } from 'react'
import Board from '@/components/board/Board'
import { defaultColumns, emptyDataSet, loadData, saveData } from '@/lib/data'
import { Plus } from '@/components/icons/Plus'
import PRModal from '@/components/pr/PRModal'
import WorkspaceTabs from '@/components/workspaces/WorkspaceTabs'
import toast, { Toaster } from 'react-hot-toast'

export default function HomePage() {
  const [workspace, setWorkspace] = useState<string>('All Projects')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [dataVersion, setDataVersion] = useState(0)

  const { columns, prs, projects } = useMemo(() => loadData(), [dataVersion])

  useEffect(() => {
    if (!columns || Object.keys(columns).length === 0) {
      saveData({ ...emptyDataSet, columns: defaultColumns })
      setDataVersion((v) => v + 1)
    }
  }, [columns])

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" />
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-semibold">PR Tracker Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" /> Add PR
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3">
          <WorkspaceTabs
            workspaces={['All Projects', ...projects.map((p) => p.name)]}
            active={workspace}
            onChange={setWorkspace}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        <Board
          initialColumns={columns}
          prs={prs}
          filterProject={workspace === 'All Projects' ? undefined : workspace}
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
        onCreate={(pr) => {
          const current = loadData()
          const next = { ...current, prs: [pr, ...current.prs] }
          saveData(next)
          setDataVersion((v) => v + 1)
          toast.success('PR added')
        }}
      />
    </div>
  )
}


