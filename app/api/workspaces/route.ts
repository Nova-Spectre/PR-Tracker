export const revalidate = 300
import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { connectMongo } from '@/lib/db'
import { verifyAuth, createAuthResponse } from '@/lib/auth'
import Workspace from '@/models/Workspace'
import PR from '@/models/PR'

export async function GET(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }
  
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  
  await connectMongo()
  
  // Filter workspaces by user and optionally by type
  const cond: any = { userId: user.id }
  if (type) {
    cond.type = type
  }
  
  const items = await Workspace.find(cond).sort({ name: 1 }).lean()
  console.log('[api.workspaces][GET] userId=', user.id, 'type=', type, 'count=', items.length, 'ms=', Date.now() - t0)
  return Response.json({ items })
}

export async function POST(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }
  
  const body = await request.json()
  const { name, type } = body || {}
  if (!name || !type) return new Response('Missing fields', { status: 400 })
  
  try {
    await connectMongo()
    // Create workspace associated with the authenticated user
    const doc = await Workspace.create({ name, type, userId: user.id })
    console.log('[api.workspaces][POST] created', doc._id, 'userId=', user.id, 'ms=', Date.now() - t0)
    revalidatePath('/api/workspaces')
    return Response.json({ item: doc }, { status: 201 })
  } catch (e: any) {
    console.error('[api.workspaces][POST] error', e)
    if (e?.code === 11000) return new Response('Duplicate workspace name for this user', { status: 409 })
    return new Response('Failed', { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }
  
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || undefined
  const name = searchParams.get('name') || undefined
  if (!type || !name) return new Response('Missing fields', { status: 400 })
  
  await connectMongo()
  
  // Guard: do not allow delete if PRs reference this workspace (for this user)
  const count = await PR.countDocuments({
    userId: user.id,
    ...(type === 'project' ? { project: name } : { service: name })
  })
  if (count > 0) return new Response('Workspace is in use by your PRs', { status: 409 })
  
  // Delete workspace only if it belongs to the authenticated user
  const res = await Workspace.deleteOne({ userId: user.id, type, name })
  if (res.deletedCount === 0) return new Response('Workspace not found', { status: 404 })
  
  console.log('[api.workspaces][DELETE] deleted', type, name, 'userId=', user.id, 'ms=', Date.now() - t0)
  revalidatePath('/api/workspaces')
  return new Response(null, { status: 204 })
}


