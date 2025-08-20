// Cache this API response for 60s on Vercel/Netlify (ISR-like for route handlers)
export const revalidate = 60

import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createPR, getPRs, updatePR, deletePR } from '@/lib/queries'
import { verifyAuth, createAuthResponse } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project') || undefined
  const status = searchParams.get('status') || undefined
  console.log('[api.prs][GET] query=', { project, status, userId: user.id })
  
  try {
    // Get PRs for the authenticated user only
    const prs = await getPRs({ project, status, userId: user.id } as any)
    console.log('[api.prs][GET] count=', prs.length, 'ms=', Date.now() - t0)
    return Response.json({ prs })
  } catch (err) {
    console.error('[api.prs][GET] error:', err)
    return new Response('Failed to fetch PRs', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  const body = await request.json()
  
  // Validate required fields based on category
  if (body.category === 'project' && (!body.project || body.project.trim() === '')) {
    return new Response('Project name is required for project-type PRs', { status: 400 })
  }
  
  if (body.category === 'service' && (!body.service || body.service.trim() === '')) {
    return new Response('Service name is required for service-type PRs', { status: 400 })
  }
  
  // Add userId to the PR data (convert to ObjectId if needed)
  const prData = { ...body, userId: user.id }
  console.log('[api.prs][POST] body=', prData)
  
  try {
    const pr = await createPR(prData)
    console.log('[api.prs][POST] created id=', pr.id, 'ms=', Date.now() - t0)
    // Invalidate cached list
    revalidatePath('/api/prs')
    return Response.json({ pr }, { status: 201 })
  } catch (err) {
    console.error('[api.prs][POST] error:', err)
    return new Response('Failed to create PR', { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const t0 = Date.now()
  
  // Verify authentication
  const user = await verifyAuth(request)
  if (!user) {
    return createAuthResponse('Authentication required')
  }

  const body = await request.json()
  const { id, ...updates } = body
  console.log('[api.prs][PATCH] id=', id, 'updates=', updates, 'userId=', user.id)
  
  try {
    // Update PR only if it belongs to the authenticated user
    const pr = await updatePR(id, updates, user.id)
    console.log('[api.prs][PATCH] ok ms=', Date.now() - t0)
    revalidatePath('/api/prs')
    return Response.json({ pr })
  } catch (err) {
    console.error('[api.prs][PATCH] error:', err)
    return new Response('Failed to update PR', { status: 500 })
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
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })
  console.log('[api.prs][DELETE] id=', id, 'userId=', user.id)
  try {
    // Delete PR only if it belongs to the authenticated user
    await deletePR(id, user.id)
    console.log('[api.prs][DELETE] ok ms=', Date.now() - t0)
    revalidatePath('/api/prs')
    return Response.json({ success: true })
  } catch (err) {
    console.error('[api.prs][DELETE] error:', err)
    return new Response('Failed to delete PR', { status: 500 })
  }
}

