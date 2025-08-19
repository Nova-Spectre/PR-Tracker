import { createPR, getPRs, updatePR, deletePR } from '@/lib/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project') || undefined
  const status = searchParams.get('status') || undefined
  const prs = await getPRs({ project, status } as any)
  return Response.json({ prs })
}

export async function POST(request: Request) {
  const body = await request.json()
  const pr = await createPR(body)
  return Response.json({ pr }, { status: 201 })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body
  const pr = await updatePR(id, updates)
  return Response.json({ pr })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })
  await deletePR(id)
  return new Response(null, { status: 204 })
}


