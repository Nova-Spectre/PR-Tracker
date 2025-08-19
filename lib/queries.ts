import { Types } from 'mongoose'
import { connectMongo } from './db'
import PR from '@/models/PR'
import { BoardColumns, DataSet, PRItem, ColumnId, Category, Priority } from './types'

type Filter = Partial<Pick<PRItem, 'project' | 'status'>>

type DbPR = {
  _id?: any
  id?: string
  title: string
  project: string
  service?: string
  category: string
  author: string
  description?: string
  status: ColumnId
  priority: string
  links?: { url: string; label?: string }[]
  scheduledDate?: string
  scheduledTime?: string
  emailReminder?: boolean
  calendarEvent?: boolean
}

function mapDoc(d: DbPR): PRItem {
  return {
    id: d.id || String(d._id!),
    title: d.title,
    project: d.project,
    service: d.service,
    category: d.category as Category,
    author: d.author,
    description: d.description,
    status: d.status,
    priority: d.priority as Priority,
    links: d.links || [],
    scheduledDate: d.scheduledDate,
    scheduledTime: d.scheduledTime,
    emailReminder: d.emailReminder,
    calendarEvent: d.calendarEvent
  }
}

export async function getPRs(filter: Filter = {}): Promise<PRItem[]> {
  await connectMongo()
  const docs = await PR.find(filter).sort({ updatedAt: -1 }).lean<DbPR[]>()
  return docs.map(mapDoc)
}

export async function createPR(data: Omit<PRItem, 'id' | 'status'> & { status?: ColumnId }): Promise<PRItem> {
  await connectMongo()
  const id = new Types.ObjectId().toString()
  const doc = await PR.create({ id, status: 'initial', ...data })
  return mapDoc(doc.toObject())
}

export async function updatePR(id: string, update: Partial<PRItem>): Promise<PRItem | null> {
  await connectMongo()
  const doc = await PR.findOneAndUpdate({ id }, update, { new: true }).lean<DbPR | null>()
  if (!doc) return null
  return mapDoc(doc)
}

export async function updatePRStatus(id: string, status: ColumnId): Promise<void> {
  await connectMongo()
  await PR.updateOne({ id }, { $set: { status } })
}

export async function deletePR(id: string): Promise<void> {
  await connectMongo()
  await PR.deleteOne({ id })
}


