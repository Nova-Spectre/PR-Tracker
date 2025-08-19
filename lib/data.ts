import { BoardColumns, DataSet, PRItem } from './types'

export const STORAGE_KEY = 'pr-tracker-data-v1'

export const defaultColumns: BoardColumns = {
  initial: { id: 'initial', title: 'Initial' },
  in_review: { id: 'in_review', title: 'In Review' },
  approved: { id: 'approved', title: 'Approved' },
  merged: { id: 'merged', title: 'Merged' },
  released: { id: 'released', title: 'Released' },
}

export const samplePRs: PRItem[] = [
  {
    id: '1',
    title: 'Add user authentication',
    project: 'Frontend App',
    service: 'User Management',
    category: 'project',
    author: 'john.doe',
    description: 'Implement OAuth login with GitHub and Google providers',
    status: 'initial',
    priority: 'high',
    links: [
      { url: 'https://github.com/example/frontend/pull/123', label: 'GitHub PR' }
    ],
    scheduledDate: '2024-01-15',
    scheduledTime: '09:00',
    emailReminder: true,
    calendarEvent: true
  },
  {
    id: '2',
    title: 'Database migration script',
    project: 'Backend API',
    service: 'Database Service',
    category: 'service',
    author: 'sarah.wilson',
    description: 'Update schema for new user roles and permissions',
    status: 'in_review',
    priority: 'critical',
    links: [
      { url: 'https://gitlab.com/example/backend/merge_requests/456', label: 'GitLab MR' }
    ],
    scheduledDate: '2024-01-16',
    scheduledTime: '14:00',
    emailReminder: true,
    calendarEvent: false
  },
  {
    id: '3',
    title: 'Fix responsive design issues',
    project: 'Frontend App',
    service: 'UI Components',
    category: 'project',
    author: 'mike.chen',
    description: 'Mobile layout improvements for dashboard',
    status: 'approved',
    priority: 'medium',
    links: [
      { url: 'https://github.com/example/frontend/pull/789', label: 'GitHub PR' }
    ]
  }
]

export const emptyDataSet: DataSet = {
  columns: defaultColumns,
  prs: samplePRs,
  projects: [],
  services: []
}

export function clearCorruptedData() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
    console.log('Cleared corrupted data, starting fresh')
  } catch (e) {
    console.error('Failed to clear data:', e)
  }
}

export function loadData(): DataSet {
  if (typeof window === 'undefined') return emptyDataSet
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDataSet
    const parsed = JSON.parse(raw) as Partial<DataSet>
    
    // Backward compatibility defaults
    const columns = parsed.columns || defaultColumns
    const rawPrs = parsed.prs || []
    
    // Ensure all PRs have required fields with defaults
    const prs = rawPrs.map(pr => ({
      id: pr.id || `pr_${Date.now()}_${Math.random()}`,
      title: pr.title || 'Untitled PR',
      project: pr.project || 'General',
      service: pr.service || '',
      category: pr.category || 'project',
      author: pr.author || 'unknown',
      description: pr.description || '',
      status: pr.status || 'initial',
      priority: pr.priority || 'medium',
      links: pr.links || [],
      scheduledDate: pr.scheduledDate,
      scheduledTime: pr.scheduledTime,
      emailReminder: pr.emailReminder || false,
      calendarEvent: pr.calendarEvent || false
    })) as PRItem[]
    
    const projects = parsed.projects || []
    const services = parsed.services || []
    
    return { columns, prs, projects, services }
  } catch (e) {
    console.error('Error loading data:', e)
    clearCorruptedData()
    return emptyDataSet
  }
}

export function saveData(data: DataSet) {
  if (typeof window === 'undefined') return
  const projectSet = new Set(data.prs.filter(p => p.category === 'project').map((p) => p.project))
  const serviceSet = new Set(data.prs.filter(p => p.category === 'service' && p.service).map((p) => p.service!))
  const projects = Array.from(projectSet).map((name) => ({ name, category: 'project' as const }))
  const services = Array.from(serviceSet).map((name) => ({ name, category: 'service' as const }))
  const payload: DataSet = { columns: data.columns || defaultColumns, prs: data.prs || [], projects, services }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function upsertPR(pr: PRItem) {
  const current = loadData()
  const idx = current.prs.findIndex((p) => p.id === pr.id)
  if (idx >= 0) current.prs[idx] = pr
  else current.prs.unshift(pr)
  saveData(current)
}


