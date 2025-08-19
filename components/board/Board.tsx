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
}

export default function Board({ initialColumns, prs, filterProject, onChange }: Props) {
  const columns = useMemo(() => initialColumns, [initialColumns])
  const filtered = useMemo(
    () => (filterProject ? prs.filter((p) => p.project === filterProject) : prs),
    [prs, filterProject]
  )

  function handleDragEnd(result: DropResult) {
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

    const updated: PRItem = { ...pr, status: destination.droppableId as PRItem['status'] }
    const nextPrs = [...prs]
    nextPrs[prIndex] = updated
    
    // Create a proper DataSet object
    const projectSet = new Set(nextPrs.filter(p => p.category === 'project').map((p) => p.project))
    const serviceSet = new Set(nextPrs.filter(p => p.category === 'service' && p.service).map((p) => p.service!))
    const projects = Array.from(projectSet).map((name) => ({ name, category: 'project' as const }))
    const services = Array.from(serviceSet).map((name) => ({ name, category: 'service' as const }))
    
    onChange({ columns, prs: nextPrs, projects, services })
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
                  {filtered
                    .filter((p) => p.status === col.id)
                    .map((pr, index) => (
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
                            <PRCard pr={pr} />
                          </div>
                        )}
                      </Draggable>
                    ))}
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


