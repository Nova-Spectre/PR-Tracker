export const revalidate = 300
import { revalidatePath } from 'next/cache'
import { connectMongo } from '@/lib/db'
import Defaults from '@/models/Defaults'

export async function GET() {
  await connectMongo()
  const doc = await Defaults.findOne({ key: 'global' }).lean()
  return Response.json({ defaults: doc || {} })
}

export async function POST(request: Request) {
  await connectMongo()
  const body = await request.json()
  const { defaultProject, defaultService, defaultEmail, defaultAuthor } = body || {}
  const update: any = {}
  if (defaultProject !== undefined) update.defaultProject = defaultProject
  if (defaultService !== undefined) update.defaultService = defaultService
  if (defaultEmail !== undefined) update.defaultEmail = defaultEmail
  if (defaultAuthor !== undefined) update.defaultAuthor = defaultAuthor
  const doc = await Defaults.findOneAndUpdate({ key: 'global' }, update, { upsert: true, new: true }).lean()
  revalidatePath('/api/defaults')
  return Response.json({ defaults: doc }, { status: 201 })
}


