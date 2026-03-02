import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

// Validate that the key looks like a real UploadThing key (alphanumeric, hyphens, underscores, dots)
const FILE_KEY_RE = /^[\w.\-]{4,256}$/

export async function POST(req: NextRequest) {
  await requireAdmin()

  const body = await req.json()
  const { fileKey } = body

  if (!fileKey || typeof fileKey !== 'string') {
    return NextResponse.json({ error: 'fileKey required' }, { status: 400 })
  }
  if (!FILE_KEY_RE.test(fileKey)) {
    return NextResponse.json({ error: 'Invalid fileKey' }, { status: 400 })
  }

  await storage.deleteFiles([fileKey])
  await prisma.mediaFile.deleteMany({ where: { fileKey } })

  return NextResponse.json({ ok: true })
}
