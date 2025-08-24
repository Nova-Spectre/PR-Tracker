"use client"

interface WorkspaceTabsProps {
  workspaces: string[]
  active: string
  onChange: (v: string) => void
  projectWorkspaces?: string[]
  serviceWorkspaces?: string[]
}

export default function WorkspaceTabs({ workspaces, active, onChange, projectWorkspaces = [], serviceWorkspaces = [] }: WorkspaceTabsProps) {
  
  const getWorkspaceType = (workspace: string) => {
    if (workspace === 'All Projects') return 'all'
    if (projectWorkspaces.includes(workspace)) return 'project'
    if (serviceWorkspaces.includes(workspace)) return 'service'
    return 'unknown'
  }
  
  const getWorkspaceIcon = (workspace: string) => {
    const type = getWorkspaceType(workspace)
    switch (type) {
      case 'all': return '📋'
      case 'project': return '📁'
      case 'service': return '⚙️'
      default: return '📄'
    }
  }
  return (
    <div className="relative">
      {/* Scrollable container with fade indicators */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {workspaces.map((w) => {
          const type = getWorkspaceType(w)
          const icon = getWorkspaceIcon(w)
          return (
            <button
              key={w}
              className={`px-3 py-1.5 rounded-md border text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 flex items-center gap-1.5 ${
                active === w 
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium' 
                  : 'bg-muted/50 border-border hover:bg-muted hover:border-border/80 text-muted-foreground hover:text-foreground'
              } ${
                type === 'project' ? 'border-l-4 border-l-blue-400' :
                type === 'service' ? 'border-l-4 border-l-green-400' :
                type === 'all' ? 'border-l-4 border-l-purple-400' : ''
              }`}
              onClick={() => onChange(w)}
              title={`${type === 'project' ? 'Project' : type === 'service' ? 'Service' : 'All'}: ${w}`}
            >
              <span className="text-sm">{icon}</span>
              <span>{w}</span>
            </button>
          )
        })}
      </div>
      
      {/* Fade indicators for overflow */}
      {workspaces.length > 3 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-card/80 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-card/80 to-transparent pointer-events-none" />
        </>
      )}
      
      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}


