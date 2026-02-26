import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

export const runtime = 'nodejs'
const utapi = new UTApi()

export async function GET() {
  await requireAdmin()

  const { files } = await utapi.listFiles()
  const tracked = await prisma.mediaFile.findMany({
    where: { provider: 'UPLOADTHING' },
    select: { fileKey: true },
  })

  const trackedKeys = new Set(tracked.map((f: { fileKey: string }) => f.fileKey))
  const orphans = files.filter((f: { key: string }) => !trackedKeys.has(f.key))

  if (orphans.length > 0) {
    await utapi.deleteFiles(orphans.map((f: { key: string }) => f.key))
  }

  return NextResponse.json({
    total: files.length,
    tracked: tracked.length,
    orphansDeleted: orphans.length,
    orphanKeys: orphans.map((f: { key: string }) => f.key),
  })
}
