export const revalidate = 300
import { revalidatePath } from 'next/cache'
import { connectMongo } from '@/lib/db'
import Workspace from '@/models/Workspace'
import PR from '@/models/PR'

export async function GET(request: Request) {
  const t0 = Date.now()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  await connectMongo()
  const cond = type ? { type } : {}
  const items = await Workspace.find(cond).sort({ name: 1 }).lean()
  console.log('[api.workspaces][GET] type=', type, 'count=', items.length, 'ms=', Date.now() - t0)
  return Response.json({ items })
}

export async function POST(request: Request) {
  const t0 = Date.now()
  const body = await request.json()
  const { name, type } = body || {}
  if (!name || !type) return new Response('Missing fields', { status: 400 })
  try {
    await connectMongo()
    const doc = await Workspace.create({ name, type })
    console.log('[api.workspaces][POST] created', doc._id, 'ms=', Date.now() - t0)
    revalidatePath('/api/workspaces')
    return Response.json({ item: doc }, { status: 201 })
  } catch (e: any) {
    console.error('[api.workspaces][POST] error', e)
    if (e?.code === 11000) return new Response('Duplicate', { status: 409 })
    return new Response('Failed', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  const name = searchParams.get('name') || undefined
  if (!type || !name) return new Response('Missing fields', { status: 400 })
  await connectMongo()
  // Guard: do not allow delete if PRs reference this workspace
  const count = await PR.countDocuments(
    type === 'project' ? { project: name } : { service: name }
  )
  if (count > 0) return new Response('In use', { status: 409 })
  const res = await Workspace.deleteOne({ type, name })
  if (res.deletedCount === 0) return new Response(null, { status: 404 })
  revalidatePath('/api/workspaces')
  return new Response(null, { status: 204 })
}


