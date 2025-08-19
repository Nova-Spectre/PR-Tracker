// Cache this API response for 60s on Vercel/Netlify (ISR-like for route handlers)
export const revalidate = 60

import { revalidatePath } from 'next/cache'
import { createPR, getPRs, updatePR, deletePR } from '@/lib/queries'

export async function GET(request: Request) {
  const t0 = Date.now()
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project') || undefined
  const status = searchParams.get('status') || undefined
  console.log('[api.prs][GET] query=', { project, status })
  try {
    const prs = await getPRs({ project, status } as any)
    console.log('[api.prs][GET] count=', prs.length, 'ms=', Date.now() - t0)
    return Response.json({ prs })
  } catch (err) {
    console.error('[api.prs][GET] error:', err)
    return new Response('Failed to fetch PRs', { status: 500 })
  }
}

export async function POST(request: Request) {
  const t0 = Date.now()
  const body = await request.json()
  console.log('[api.prs][POST] body=', body)
  try {
    const pr = await createPR(body)
    console.log('[api.prs][POST] created id=', pr.id, 'ms=', Date.now() - t0)
    // Invalidate cached list
    revalidatePath('/api/prs')
    return Response.json({ pr }, { status: 201 })
  } catch (err) {
    console.error('[api.prs][POST] error:', err)
    return new Response('Failed to create PR', { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const t0 = Date.now()
  const body = await request.json()
  const { id, ...updates } = body
  console.log('[api.prs][PATCH] id=', id, 'updates=', updates)
  try {
    const pr = await updatePR(id, updates)
    console.log('[api.prs][PATCH] ok ms=', Date.now() - t0)
    revalidatePath('/api/prs')
    return Response.json({ pr })
  } catch (err) {
    console.error('[api.prs][PATCH] error:', err)
    return new Response('Failed to update PR', { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const t0 = Date.now()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })
  console.log('[api.prs][DELETE] id=', id)
  try {
    await deletePR(id)
    console.log('[api.prs][DELETE] ok ms=', Date.now() - t0)
    revalidatePath('/api/prs')
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error('[api.prs][DELETE] error:', err)
    return new Response('Failed to delete PR', { status: 500 })
  }
}


