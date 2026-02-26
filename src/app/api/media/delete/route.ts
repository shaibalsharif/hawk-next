import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

export const runtime = 'nodejs'
const utapi = new UTApi()

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { fileKey } = await req.json()
  if (!fileKey) return NextResponse.json({ error: 'fileKey required' }, { status: 400 })

  await utapi.deleteFiles([fileKey])
  await prisma.mediaFile.deleteMany({ where: { fileKey } })
  return NextResponse.json({ ok: true })
}
