export type ColumnId = 'initial' | 'in_review' | 'approved' | 'merged' | 'released'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type Category = 'project' | 'service'

export type BoardColumn = {
  id: ColumnId
  title: string
}

export type BoardColumns = Record<ColumnId, BoardColumn>

export type PRItem = {
  id: string
  title: string
  project: string
  service?: string
  category: Category
  author: string
  description?: string
  status: ColumnId
  priority: Priority
  links?: { url: string; label?: string }[]
  scheduledDate?: string
  scheduledTime?: string
  emailReminder?: boolean
  calendarEvent?: boolean
}

export type DataSet = {
  columns: BoardColumns
  prs: PRItem[]
  projects: { name: string; category: Category }[]
  services: { name: string; category: Category }[]
}

export type EmailSchedule = {
  id: string
  prId: string
  email: string
  scheduledDate: string
  scheduledTime: string
  sent: boolean
}


