"use client"

import { useMemo, useState } from 'react'
import { PRItem, Priority, Category, ColumnId } from '@/lib/types'
import PriorityTag from '../ui/PriorityTag'
import SchedulerSettings from '../scheduler/SchedulerSettings'
import { Calendar } from '../icons'
import toast from 'react-hot-toast'

type PRDetailsProps = { open: boolean; onClose: () => void; pr: PRItem; onEdit?: (updated: PRItem) => void }

const PRDetails: React.FC<PRDetailsProps> = ({ open, onClose, pr, onEdit }) => {
  const [showScheduler, setShowScheduler] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [title, setTitle] = useState(pr.title)
  const [category, setCategory] = useState<Category>(pr.category)
  const [project, setProject] = useState(pr.project)
  const [service, setService] = useState(pr.service || '')
  const [author, setAuthor] = useState(pr.author)
  const [description, setDescription] = useState(pr.description || '')
  const [priority, setPriority] = useState<Priority>(pr.priority)
  const [status, setStatus] = useState<ColumnId>(pr.status)
  const [link, setLink] = useState(pr.links?.[0]?.url || '')

  const statusOptions = useMemo<ColumnId[]>(() => ['initial', 'in_review', 'approved', 'merged', 'released'], [])
  const priorityOptions = useMemo<Priority[]>(() => ['low', 'medium', 'high', 'critical'], [])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
        <div className="ml-auto h-full w-full max-w-lg bg-surface border-l border-border p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit PR' : 'PR Details'}</h2>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button className="btn" onClick={() => setIsEditing(true)}>Edit</button>
              )}
              <button className="btn" onClick={onClose}>Close</button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Title</div>
              {isEditing ? (
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              ) : (
                <div className="font-medium">{pr.title}</div>
              )}
            </div>

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Category</div>
              {isEditing ? (
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                </select>
              ) : (
                <div className="font-medium capitalize">{pr.category}</div>
              )}
            </div>

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">{(isEditing ? category : pr.category) === 'project' ? 'Project' : 'Service'}</div>
              {isEditing ? (
                (category === 'project') ? (
                  <input className="input" value={project} onChange={(e) => setProject(e.target.value)} />
                ) : (
                  <input className="input" value={service} onChange={(e) => setService(e.target.value)} />
                )
              ) : (
                <div className="font-medium">{pr.category === 'project' ? pr.project : pr.service}</div>
              )}
            </div>

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Author</div>
              {isEditing ? (
                <input className="input" value={author} onChange={(e) => setAuthor(e.target.value)} />
              ) : (
                <div className="font-medium">{pr.author}</div>
              )}
            </div>

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Priority</div>
              {isEditing ? (
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  <PriorityTag priority={pr.priority} />
                </div>
              )}
            </div>

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Status</div>
              {isEditing ? (
                <select className="input" value={status} onChange={(e) => setStatus(e.target.value as ColumnId)}>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              ) : (
                <div className="font-medium capitalize">{pr.status}</div>
              )}
            </div>

            {pr.links && pr.links.length > 0 && (
              <div className="card p-3 space-y-2">
                <div className="text-sm text-subtle">Link</div>
                {isEditing ? (
                  <input className="input" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
                ) : (
                  <div className="space-y-2">
                    {pr.links.map((l, index) => (
                      <a key={index} href={l.url} target="_blank" className="text-accent underline break-all">{l.url}</a>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="card p-3 space-y-2">
              <div className="text-sm text-subtle">Description</div>
              {isEditing ? (
                <textarea className="input min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
              ) : (
                <div className="text-sm whitespace-pre-wrap">{pr.description}</div>
              )}
            </div>

            {(pr.scheduledDate || pr.emailReminder || pr.calendarEvent) && (
              <div className="card p-3">
                <div className="text-sm text-subtle">Scheduling</div>
                <div className="space-y-2">
                  {pr.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{pr.scheduledDate} at {pr.scheduledTime}</span>
                    </div>
                  )}
                  {pr.emailReminder && <div className="flex items-center gap-2 text-muted">📧 Email Reminder</div>}
                  {pr.calendarEvent && <div className="flex items-center gap-2 text-muted">📅 Calendar Event</div>}
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
                <div className="text-sm text-subtle">Scheduling</div>
                <button
                  className="btn btn-primary mt-2 w-full"
                  onClick={() => setShowScheduler(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Review
                </button>
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2 justify-end">
                <button className="btn" onClick={() => {
                  // reset edits
                  setTitle(pr.title)
                  setCategory(pr.category)
                  setProject(pr.project)
                  setService(pr.service || '')
                  setAuthor(pr.author)
                  setDescription(pr.description || '')
                  setPriority(pr.priority)
                  setStatus(pr.status)
                  setLink(pr.links?.[0]?.url || '')
                  setIsEditing(false)
                }}>Cancel</button>
                <button className="btn btn-primary" onClick={async () => {
                  const updated: PRItem = {
                    ...pr,
                    title,
                    category,
                    project: category === 'project' ? project : '',
                    service: category === 'service' ? service : undefined,
                    author,
                    description,
                    priority,
                    status,
                    links: link ? [{ url: link, label: 'PR Link' }] : []
                  }
                  try {
                    const res = await fetch('/api/prs', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updated)
                    })
                    if (!res.ok) throw new Error('Failed')
                    const j = await res.json().catch(() => ({} as any))
                    const serverUpdated: PRItem = j?.pr || updated
                    onEdit?.(serverUpdated)
                    toast.success('PR updated')
                    setIsEditing(false)
                    onClose()
                  } catch (e) {
                    onEdit?.(updated)
                    toast.error('DB unavailable, saved locally')
                    setIsEditing(false)
                    onClose()
                  }
                }}>Save</button>
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

export default PRDetails


