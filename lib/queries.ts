import { Types } from 'mongoose'
// Simple in-memory cache for server runtime
const cache = new Map<string, { ts: number; data: any }>()
const TTL_MS = 60_000
import { connectMongo } from './db'
import PR from '@/models/PR'
import { BoardColumns, DataSet, PRItem, ColumnId, Category, Priority } from './types'

type Filter = Partial<Pick<PRItem, 'project' | 'status'>> & { userId?: string }

type DbPR = {
  _id?: any
  id?: string
  userId?: string
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
  // Sanitize filter: drop undefined keys so we query all when nothing provided
  const cond: Record<string, unknown> = {}
  if (filter.project) cond.project = filter.project
  if (filter.status) cond.status = filter.status
  if (filter.userId) cond.userId = filter.userId
  console.log('[queries.getPRs] filter(in)=', filter, 'cond=', cond)
  const key = `prs:${JSON.stringify(cond)}`
  const now = Date.now()
  const hit = cache.get(key)
  if (hit && now - hit.ts < TTL_MS) {
    return (hit.data as DbPR[]).map(mapDoc)
  }
  const docs = await PR.find(cond).sort({ updatedAt: -1 }).lean<DbPR[]>()
  cache.set(key, { ts: now, data: docs })
  console.log('[queries.getPRs] found=', docs.length)
  return docs.map(mapDoc)
}

export async function createPR(data: Omit<PRItem, 'id' | 'status'> & { status?: ColumnId; userId?: string }): Promise<PRItem> {
  await connectMongo()
  const id = new Types.ObjectId().toString()
  
  // Convert userId string to ObjectId for MongoDB
  const payload = { 
    id, 
    status: 'initial', 
    ...data,
    userId: data.userId ? new Types.ObjectId(data.userId) : undefined
  }
  
  console.log('[queries.createPR] payload=', payload)
  const doc = await PR.create(payload)
  console.log('[queries.createPR] created id=', id)
  cache.clear()
  return mapDoc(doc.toObject())
}

export async function updatePR(id: string, update: Partial<PRItem>, userId?: string): Promise<PRItem | null> {
  await connectMongo()
  console.log('[queries.updatePR] id=', id, 'update=', update, 'userId=', userId)
  const query = userId ? { id, userId } : { id }
  const doc = await PR.findOneAndUpdate(query, update, { new: true }).lean<DbPR | null>()
  console.log('[queries.updatePR] updated? ', !!doc)
  if (!doc) return null
  cache.clear()
  return mapDoc(doc)
}

export async function updatePRStatus(id: string, status: ColumnId): Promise<void> {
  await connectMongo()
  console.log('[queries.updatePRStatus] id=', id, 'status=', status)
  await PR.updateOne({ id }, { $set: { status } })
  cache.clear()
}

export async function deletePR(id: string, userId?: string): Promise<void> {
  await connectMongo()
  console.log('[queries.deletePR] id=', id, 'userId=', userId)
  const query = userId ? { id, userId } : { id }
  await PR.deleteOne(query)
  cache.clear()
}


