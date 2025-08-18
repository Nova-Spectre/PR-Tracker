"use client"

export default function WorkspaceTabs({ workspaces, active, onChange }: { workspaces: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {workspaces.map((w) => (
        <button
          key={w}
          className={`px-3 py-1.5 rounded-md border text-sm whitespace-nowrap ${
            active === w ? 'bg-accent/20 border-accent/40' : 'bg-muted border-border hover:bg-border'
          }`}
          onClick={() => onChange(w)}
        >
          {w}
        </button>
      ))}
    </div>
  )
}


