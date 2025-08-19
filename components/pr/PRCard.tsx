"use client"

import { PRItem } from '@/lib/types'
import { useState } from 'react'
import PRDetails from './PRDetails'
import PriorityTag from '../ui/PriorityTag'

export default function PRCard({ pr }: { pr: PRItem }) {
  const [open, setOpen] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <div className="w-full text-left card p-3 hover:border-accent/40 cursor-pointer" onClick={handleCardClick}>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-100 truncate">{pr.title}</div>
              <div className="text-xs text-gray-400 overflow-hidden text-ellipsis max-h-[2.5rem]">{pr.description}</div>
            </div>
            <PriorityTag priority={pr.priority} />
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{pr.author}</span>
            <span>•</span>
            <span className="capitalize">{pr.category}</span>
            <span>•</span>
            <span>{pr.category === 'project' ? pr.project : pr.service}</span>
          </div>

          {pr.links && pr.links.length > 0 && (
            <div className="space-y-1">
              {pr.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-accent hover:text-accent/80 underline break-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.url}
                </a>
              ))}
            </div>
          )}

          {(pr.scheduledDate || pr.emailReminder || pr.calendarEvent) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {pr.scheduledDate && (
                <span>📅 {pr.scheduledDate} {pr.scheduledTime}</span>
              )}
              {pr.emailReminder && <span>📧</span>}
              {pr.calendarEvent && <span>📅</span>}
            </div>
          )}
        </div>
      </div>

      <PRDetails open={open} onClose={() => setOpen(false)} pr={pr} />
    </>
  )
}


