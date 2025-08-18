"use client"

import { PRItem } from '@/lib/types'
import { useState } from 'react'
import PRDetails from './PRDetails'

export default function PRCard({ pr }: { pr: PRItem }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="w-full text-left card p-3 hover:border-accent/40" onClick={() => setOpen(true)}>
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="font-medium text-gray-100 truncate">{pr.title}</div>
            <div className="text-xs text-gray-400 overflow-hidden text-ellipsis max-h-[2.5rem]">{pr.description}</div>
            <div className="text-xs text-gray-400">{pr.author} • {pr.project}</div>
          </div>
        </div>
      </button>

      <PRDetails open={open} onClose={() => setOpen(false)} pr={pr} />
    </>
  )
}


