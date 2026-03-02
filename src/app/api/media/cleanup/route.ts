import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { storage } from '@/lib/storage'

export const runtime = 'nodejs'

/**
 * POST /api/media/cleanup
 *
 * Deletes any UploadThing files that are not tracked in the MediaFile table.
 * Uses POST (not GET) because this is a destructive operation.
 */
export async function POST() {
  await requireAdmin()

  const [storageFiles, tracked] = await Promise.all([
    storage.listFiles(),
    prisma.mediaFile.findMany({
      where: { provider: 'UPLOADTHING' },
      select: { fileKey: true },
    }),
  ])

  const trackedKeys = new Set(tracked.map((f) => f.fileKey))
  const orphans = storageFiles.filter((f) => !trackedKeys.has(f.key))

  if (orphans.length > 0) {
    await storage.deleteFiles(orphans.map((f) => f.key))
  }

  return NextResponse.json({
    total: storageFiles.length,
    tracked: tracked.length,
    orphansDeleted: orphans.length,
    orphanKeys: orphans.map((f) => f.key),
  })
}
