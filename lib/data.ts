import { BoardColumns, DataSet, PRItem } from './types'

const STORAGE_KEY = 'pr-tracker-data-v1'

export const defaultColumns: BoardColumns = {
  initial: { id: 'initial', title: 'Initial' },
  in_review: { id: 'in_review', title: 'In Review' },
  approved: { id: 'approved', title: 'Approved' },
  merged: { id: 'merged', title: 'Merged' },
  released: { id: 'released', title: 'Released' },
}

export const emptyDataSet: DataSet = {
  columns: defaultColumns,
  prs: [],
  projects: [],
}

export function loadData(): DataSet {
  if (typeof window === 'undefined') return emptyDataSet
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDataSet
    const parsed: DataSet = JSON.parse(raw)
    return parsed
  } catch (e) {
    return emptyDataSet
  }
}

export function saveData(data: DataSet) {
  if (typeof window === 'undefined') return
  const projectSet = new Set(data.prs.map((p) => p.project))
  const projects = Array.from(projectSet).map((name) => ({ name }))
  const payload: DataSet = { ...data, projects }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function upsertPR(pr: PRItem) {
  const current = loadData()
  const idx = current.prs.findIndex((p) => p.id === pr.id)
  if (idx >= 0) current.prs[idx] = pr
  else current.prs.unshift(pr)
  saveData(current)
}


