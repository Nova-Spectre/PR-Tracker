import { Priority } from '@/lib/types'

const priorityConfig = {
  low: { color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
  critical: { color: 'bg-red-500/20 text-red-400 border-red-500/40' }
}

export default function PriorityTag({ priority }: { priority: Priority }) {
  // Fallback to medium if priority is undefined or invalid
  const safePriority = priority && priorityConfig[priority] ? priority : 'medium'
  const config = priorityConfig[safePriority]
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {safePriority.charAt(0).toUpperCase() + safePriority.slice(1)}
    </span>
  )
}
