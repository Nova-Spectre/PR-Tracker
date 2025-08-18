export type ColumnId = 'initial' | 'in_review' | 'approved' | 'merged' | 'released'

export type BoardColumn = {
  id: ColumnId
  title: string
}

export type BoardColumns = Record<ColumnId, BoardColumn>

export type PRItem = {
  id: string
  title: string
  project: string
  author: string
  description?: string
  status: ColumnId
  links?: { url: string; label?: string }[]
}

export type DataSet = {
  columns: BoardColumns
  prs: PRItem[]
  projects: { name: string }[]
}


