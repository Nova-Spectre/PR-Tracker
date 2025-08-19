"use client"

import { useState } from 'react'
import { PRItem, Priority, Category } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export default function PRModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (pr: PRItem) => void }) {
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [service, setService] = useState('')
  const [category, setCategory] = useState<Category>('project')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [link, setLink] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [emailReminder, setEmailReminder] = useState(false)
  const [calendarEvent, setCalendarEvent] = useState(false)

  if (!open) return null

  function submit() {
    const newPr: PRItem = {
      id: uuidv4(),
      title,
      project: category === 'project' ? project : '',
      service: category === 'service' ? service : '',
      category,
      author: author || 'unknown',
      description,
      status: 'initial',
      priority,
      links: link ? [{ url: link, label: 'PR Link' }] : [],
      scheduledDate: scheduledDate || undefined,
      scheduledTime: scheduledTime || undefined,
      emailReminder,
      calendarEvent
    }
    onCreate(newPr)
    onClose()
    // Reset form
    setTitle('')
    setProject('')
    setService('')
    setCategory('project')
    setAuthor('')
    setDescription('')
    setPriority('medium')
    setLink('')
    setScheduledDate('')
    setScheduledTime('')
    setEmailReminder(false)
    setCalendarEvent(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl card p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Pull Request</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PR title" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category *</label>
              <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                <option value="project">Project</option>
                <option value="service">Service</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority *</label>
              <select className="input mt-1" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category === 'project' ? (
              <div>
                <label className="text-sm font-medium">Project Name *</label>
                <input className="input mt-1" value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. Frontend App" />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Service Name *</label>
                <input className="input mt-1" value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. User Service" />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Author</label>
              <input className="input mt-1" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="your.name" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Link (GitHub/GitLab/Tracker)</label>
            <input className="input mt-1" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea className="input mt-1 min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-3">Scheduling (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Date</label>
                <input type="date" className="input mt-1" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Time</label>
                <input type="time" className="input mt-1" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={emailReminder} onChange={(e) => setEmailReminder(e.target.checked)} />
                <span className="text-sm">Email Reminder</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={calendarEvent} onChange={(e) => setCalendarEvent(e.target.checked)} />
                <span className="text-sm">Add to Calendar</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!title || (category === 'project' && !project) || (category === 'service' && !service)} onClick={submit}>
            Create PR
          </button>
        </div>
      </div>
    </div>
  )
}


