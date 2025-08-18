"use client"

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import ColumnHeader from './ColumnHeader'
import PRCard from '../pr/PRCard'
import { BoardColumns, PRItem } from '@/lib/types'
import { useMemo } from 'react'

type Props = {
  initialColumns: BoardColumns
  prs: PRItem[]
  filterProject?: string
  onChange: (next: { columns: BoardColumns; prs: PRItem[]; projects: { name: string }[] }) => void
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
    onChange({ columns, prs: nextPrs, projects: [] })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {Object.values(columns).map((col) => (
          <div key={col.id} className="flex flex-col min-h-[60vh]">
            <ColumnHeader title={col.title} count={filtered.filter((p) => p.status === col.id).length} />
            <Droppable droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mt-2 flex-1 card p-3 space-y-3"
                >
                  {filtered
                    .filter((p) => p.status === col.id)
                    .map((pr, index) => (
                      <Draggable draggableId={pr.id} index={index} key={pr.id}>
                        {(dp) => (
                          <div ref={dp.innerRef} {...dp.draggableProps} {...dp.dragHandleProps}>
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


