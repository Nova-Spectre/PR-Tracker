"use client"

import { useState } from 'react'
import { PRItem } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

export default function PRModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (pr: PRItem) => void }) {
  const [title, setTitle] = useState('')
  const [project, setProject] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')

  if (!open) return null

  function submit() {
    const newPr: PRItem = {
      id: uuidv4(),
      title,
      project: project || 'General',
      author: author || 'unknown',
      description,
      status: 'initial',
      links: link ? [{ url: link, label: 'PR Link' }] : []
    }
    onCreate(newPr)
    onClose()
    setTitle('')
    setProject('')
    setAuthor('')
    setDescription('')
    setLink('')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full max-w-lg card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add Pull Request</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm">Title</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="PR title" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Project/Service</label>
              <input className="input mt-1" value={project} onChange={(e) => setProject(e.target.value)} placeholder="e.g. Frontend" />
            </div>
            <div>
              <label className="text-sm">Author</label>
              <input className="input mt-1" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="your.name" />
            </div>
          </div>
          <div>
            <label className="text-sm">Link (GitHub/GitLab/Tracker)</label>
            <input className="input mt-1" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="text-sm">Description</label>
            <textarea className="input mt-1 min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!title} onClick={submit}>Create</button>
        </div>
      </div>
    </div>
  )
}


