"use client"

import { useState } from 'react'
import { PRItem } from '@/lib/types'
import PriorityTag from '../ui/PriorityTag'
import SchedulerSettings from '../scheduler/SchedulerSettings'
import { Calendar } from '../icons'

export default function PRDetails({ open, onClose, pr }: { open: boolean; onClose: () => void; pr: PRItem }) {
  const [showScheduler, setShowScheduler] = useState(false)

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
        <div className="ml-auto h-full w-full max-w-lg bg-surface border-l border-border p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">PR Details</h2>
            <button className="btn" onClick={onClose}>Close</button>
          </div>
          
          <div className="space-y-4">
            <div className="card p-3">
              <div className="text-sm text-gray-400">Title</div>
              <div className="font-medium">{pr.title}</div>
            </div>

            <div className="card p-3">
              <div className="text-sm text-gray-400">Category</div>
              <div className="font-medium capitalize">{pr.category}</div>
            </div>

            <div className="card p-3">
              <div className="text-sm text-gray-400">{pr.category === 'project' ? 'Project' : 'Service'}</div>
              <div className="font-medium">{pr.category === 'project' ? pr.project : pr.service}</div>
            </div>

            <div className="card p-3">
              <div className="text-sm text-gray-400">Author</div>
              <div className="font-medium">{pr.author}</div>
            </div>

            <div className="card p-3">
              <div className="text-sm text-gray-400">Priority</div>
              <div className="flex items-center gap-2">
                <PriorityTag priority={pr.priority} />
              </div>
            </div>

            <div className="card p-3">
              <div className="text-sm text-gray-400">Status</div>
              <div className="font-medium capitalize">{pr.status}</div>
            </div>

            {pr.links && pr.links.length > 0 && (
              <div className="card p-3">
                <div className="text-sm text-gray-400">Links</div>
                <div className="space-y-2">
                  {pr.links.map((l, index) => (
                    <a key={index} href={l.url} target="_blank" className="text-accent underline break-all">{l.url}</a>
                  ))}
                </div>
              </div>
            )}

            {pr.description && (
              <div className="card p-3">
                <div className="text-sm text-gray-400">Description</div>
                <div className="text-sm whitespace-pre-wrap">{pr.description}</div>
              </div>
            )}

            {(pr.scheduledDate || pr.emailReminder || pr.calendarEvent) && (
              <div className="card p-3">
                <div className="text-sm text-gray-400">Scheduling</div>
                <div className="space-y-2">
                  {pr.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{pr.scheduledDate} at {pr.scheduledTime}</span>
                    </div>
                  )}
                  {pr.emailReminder && <div className="flex items-center gap-2">📧 Email Reminder</div>}
                  {pr.calendarEvent && <div className="flex items-center gap-2">📅 Calendar Event</div>}
                </div>
                <button
                  className="btn btn-primary mt-3 w-full"
                  onClick={() => setShowScheduler(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule/Reschedule
                </button>
              </div>
            )}

            {!pr.scheduledDate && (
              <div className="card p-3">
                <div className="text-sm text-gray-400">Scheduling</div>
                <button
                  className="btn btn-primary mt-2 w-full"
                  onClick={() => setShowScheduler(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showScheduler && (
        <SchedulerSettings
          pr={pr}
          onClose={() => setShowScheduler(false)}
        />
      )}
    </>
  )
}


