import { prisma } from '@/lib/prisma'
import AboutEditor from '@/components/admin/AboutEditor'
import type { AboutCover, AboutInner, TeamMember, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminAboutPage() {
  const [rawCover, rawInner, rawMembers] = await Promise.all([
    prisma.aboutCover.findUnique({ where: { id: 'singleton' } }),
    prisma.aboutInner.findUnique({ where: { id: 'singleton' } }),
    prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: AboutCover | null = rawCover
    ? { ...rawCover, imageMeta: rawCover.imageMeta as unknown as MediaMeta | null }
    : null

  const inner: AboutInner | null = rawInner ?? null

  const members: TeamMember[] = rawMembers.map((m: typeof rawMembers[number]) => ({
    ...m,
    imageMeta: m.imageMeta as unknown as MediaMeta | null,
  }))

  return <AboutEditor initialCover={cover} initialInner={inner} initialMembers={members} />
}
