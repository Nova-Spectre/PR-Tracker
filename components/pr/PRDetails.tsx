"use client"

import { PRItem } from '@/lib/types'

export default function PRDetails({ open, onClose, pr }: { open: boolean; onClose: () => void; pr: PRItem }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex">
      <div className="ml-auto h-full w-full max-w-lg bg-surface border-l border-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">PR Details</h2>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="mt-4 space-y-4">
          <div className="card p-3">
            <div className="text-sm text-gray-400">Title</div>
            <div className="font-medium">{pr.title}</div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-400">Project</div>
            <div className="font-medium">{pr.project}</div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-400">Author</div>
            <div className="font-medium">{pr.author}</div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-400">Status</div>
            <div className="font-medium capitalize">{pr.status}</div>
          </div>
          <div className="card p-3">
            <div className="text-sm text-gray-400">Links</div>
            <div className="space-y-2">
              {pr.links?.map((l) => (
                <a key={l.url} href={l.url} target="_blank" className="text-accent underline break-all">{l.label || l.url}</a>
              ))}
              {!pr.links?.length && <div className="text-sm text-gray-400">No links provided</div>}
            </div>
          </div>
          {pr.description && (
            <div className="card p-3">
              <div className="text-sm text-gray-400">Description</div>
              <div className="text-sm whitespace-pre-wrap">{pr.description}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


