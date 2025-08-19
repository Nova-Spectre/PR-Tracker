"use client"

import { useEffect, useState } from 'react'
import { PRItem, Priority, Category } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'
import { cachedFetchJSON } from '@/lib/clientCache'

export default function PRModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (pr: PRItem) => void }) {
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('General')
  const [service, setService] = useState('')
  const [category, setCategory] = useState<Category>('project')
  const [author, setAuthor] = useState('Shubham')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [link, setLink] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [emailReminder, setEmailReminder] = useState(false)
  const [calendarEvent, setCalendarEvent] = useState(false)
  const [projects, setProjects] = useState<string[]>(['General'])
  const [services, setServices] = useState<string[]>([])
  const [showAddWorkspace, setShowAddWorkspace] = useState<null | 'project' | 'service'>(null)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        // load defaults
        try {
          const dj = await cachedFetchJSON<{ defaults?: any }>('/api/defaults', 300000)
          const d = dj?.defaults || {}
          if (!cancelled) {
            if (d?.defaultProject) setProject(String(d.defaultProject))
            if (d?.defaultService) setService(String(d.defaultService))
            if (d?.defaultAuthor) setAuthor(String(d.defaultAuthor))
          }
        } catch (_) {}
        const pJson = await cachedFetchJSON<{ items: any[] }>('/api/workspaces?type=project', 300000)
        const sJson = await cachedFetchJSON<{ items: any[] }>('/api/workspaces?type=service', 300000)
        const pItems: any[] = Array.isArray(pJson.items) ? pJson.items : []
        const sItems: any[] = Array.isArray(sJson.items) ? sJson.items : []
        const pNames: string[] = Array.from(new Set(pItems.map((x: any) => String(x?.name ?? '')).filter(Boolean)))
        const sNames: string[] = Array.from(new Set(sItems.map((x: any) => String(x?.name ?? '')).filter(Boolean)))
        const pList: string[] = ['General', ...pNames]
        const sList: string[] = [...sNames]
        if (!cancelled) {
          setProjects(pList)
          setServices(sList)
          if (!pList.includes(project)) setProject(pList[0] || 'General')
        }
      } catch (e) {
        // ignore; keep defaults
      }
    })()
    return () => { cancelled = true }
  }, [open])

  if (!open) return null

  function submit() {
    const newPr: PRItem = {
      id: uuidv4(),
      title,
      project: category === 'project' ? project : '',
      service: category === 'service' ? service : '',
      category,
      author: author || 'Shubham',
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
                <label className="text-sm font-medium">Project *</label>
                <div className="flex gap-2">
                  <select className="input mt-1 flex-1" value={project} onChange={(e) => setProject(e.target.value)}>
                    {projects.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <button type="button" className="btn mt-1" onClick={() => { setShowAddWorkspace('project'); setNewWorkspaceName('') }}>Add</button>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Service *</label>
                <div className="flex gap-2">
                  <select className="input mt-1 flex-1" value={service} onChange={(e) => setService(e.target.value)}>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button type="button" className="btn mt-1" onClick={() => { setShowAddWorkspace('service'); setNewWorkspaceName('') }}>Add</button>
                </div>
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
        {/* Add Project/Service Mini Modal */}
        {showAddWorkspace && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="card p-4 w-full max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Add {showAddWorkspace === 'project' ? 'Project' : 'Service'}</h3>
                <button className="btn" onClick={() => setShowAddWorkspace(null)}>Close</button>
              </div>
              <input
                className="input w-full mb-3"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder={showAddWorkspace === 'project' ? 'Project name' : 'Service name'}
              />
              <div className="flex justify-end gap-2">
                <button className="btn" onClick={() => setShowAddWorkspace(null)}>Cancel</button>
                <button
                  className="btn btn-primary"
                  disabled={!newWorkspaceName.trim()}
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/workspaces', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newWorkspaceName.trim(), type: showAddWorkspace })
                      })
                      if (!res.ok && res.status !== 409) throw new Error('Failed to add')
                      // Refresh lists
                      const pRes = await fetch('/api/workspaces?type=project')
                      const sRes = await fetch('/api/workspaces?type=service')
                      const pJson = pRes.ok ? await pRes.json() : { items: [] }
                      const sJson = sRes.ok ? await sRes.json() : { items: [] }
                      const pItems: any[] = Array.isArray(pJson.items) ? pJson.items : []
                      const sItems: any[] = Array.isArray(sJson.items) ? sJson.items : []
                      const pNames: string[] = Array.from(new Set(pItems.map((x: any) => String(x?.name ?? '')).filter(Boolean)))
                      const sNames: string[] = Array.from(new Set(sItems.map((x: any) => String(x?.name ?? '')).filter(Boolean)))
                      const p: string[] = ['General', ...pNames]
                      const s: string[] = [...sNames]
                      setProjects(p)
                      setServices(s)
                      if (showAddWorkspace === 'project') {
                        setProject(newWorkspaceName.trim())
                      } else {
                        setService(newWorkspaceName.trim())
                      }
                      setShowAddWorkspace(null)
                    } catch (e) {
                      setShowAddWorkspace(null)
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


