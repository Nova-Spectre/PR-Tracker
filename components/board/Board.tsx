"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import ColumnHeader from './ColumnHeader'
import PRCard from '../pr/PRCard'
import { BoardColumns, PRItem, DataSet } from '@/lib/types'
import { useMemo } from 'react'

type Props = {
  initialColumns: BoardColumns
  prs: PRItem[]
  filterProject?: string
  onChange: (next: DataSet) => void
  groupBy?: 'none' | 'project' | 'service'
}

export default function Board({ initialColumns, prs, filterProject, onChange, groupBy = 'none' }: Props) {
  const columns = useMemo(() => initialColumns, [initialColumns])
  const filtered = useMemo(
    () => (filterProject ? prs.filter((p) => p.project === filterProject) : prs),
    [prs, filterProject]
  )

  const groupKeys = useMemo(() => {
    if (groupBy === 'none') return ['__all__']
    const key = groupBy
    const set = new Set<string>()
    for (const p of filtered) {
      const v = (p as any)[key]
      if (v) set.add(String(v))
    }
    // Ensure at least one group to render
    return set.size ? Array.from(set).sort() : ['__all__']
  }, [filtered, groupBy])

  async function handleEdit(updated: PRItem) {
    const prIndex = prs.findIndex((p) => p.id === updated.id)
    if (prIndex === -1) return
    const nextPrs = [...prs]
    nextPrs[prIndex] = { ...nextPrs[prIndex], ...updated }
    
    // Update UI immediately for better UX
    const projectSet = new Set(nextPrs.filter(p => p.category === 'project').map((p) => p.project))
    const serviceSet = new Set(nextPrs.filter(p => p.category === 'service' && p.service).map((p) => p.service!))
    const projects = Array.from(projectSet).map((name) => ({ name, category: 'project' as const }))
    const services = Array.from(serviceSet).map((name) => ({ name, category: 'service' as const }))
    onChange({ columns, prs: nextPrs, projects, services })
    
    // Persist changes to database
    try {
      const response = await fetch('/api/prs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated)
      })
      
      if (!response.ok) {
        console.error('Failed to update PR in database')
        // Optionally revert the UI change or show error toast
      } else {
        console.log(`PR ${updated.id} updated in database`)
      }
    } catch (error) {
      console.error('Error updating PR:', error)
      // Optionally revert the UI change or show error toast
    }
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    const prIndex = prs.findIndex((p) => p.id === draggableId)
    if (prIndex === -1) return
    const pr = prs[prIndex]

    const newStatus = destination.droppableId as PRItem['status']
    const updated: PRItem = { ...pr, status: newStatus }
    const nextPrs = [...prs]
    nextPrs[prIndex] = updated
    
    // Update UI immediately for better UX
    const projectSet = new Set(nextPrs.filter(p => p.category === 'project').map((p) => p.project))
    const serviceSet = new Set(nextPrs.filter(p => p.category === 'service' && p.service).map((p) => p.service!))
    const projects = Array.from(projectSet).map((name) => ({ name, category: 'project' as const }))
    const services = Array.from(serviceSet).map((name) => ({ name, category: 'service' as const }))
    
    onChange({ columns, prs: nextPrs, projects, services })
    
    // Persist status change to database
    try {
      const response = await fetch('/api/prs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: pr.id,
          status: newStatus
        })
      })
      
      if (!response.ok) {
        console.error('Failed to update PR status in database')
        // Optionally revert the UI change or show error toast
      } else {
        console.log(`PR ${pr.id} status updated to ${newStatus} in database`)
      }
    } catch (error) {
      console.error('Error updating PR status:', error)
      // Optionally revert the UI change or show error toast
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.values(columns).map((col) => (
          <div key={col.id} className="flex flex-col min-h-[60vh]">
            <ColumnHeader title={col.title} count={filtered.filter((p) => p.status === col.id).length} />
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`mt-2 flex-1 card p-3 space-y-3 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-accent/10 border-accent/40' : ''
                  }`}
                >
                  {groupKeys.map((gk) => {
                    const items = filtered.filter((p) => p.status === col.id && (groupBy === 'none' || (p as any)[groupBy] === gk))
                    if (!items.length) return null
                    return (
                      <div key={`${col.id}-${gk}`} className="space-y-2">
                        {groupBy !== 'none' && (
                          <div className="text-xs uppercase tracking-wide text-subtle border-b border-border pb-1">{gk}</div>
                        )}
                        {items.map((pr, index) => (
                          <Draggable draggableId={pr.id} index={index} key={pr.id}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-transform ${
                                  snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl' : ''
                                }`}
                              >
                                <PRCard pr={pr} onEdit={handleEdit} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  )
}


