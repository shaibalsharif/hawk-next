import { prisma } from '@/lib/prisma'
import HomeEditor from '@/components/admin/HomeEditor'
import type { HomeSlide } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminHomePage() {
  const raw = await prisma.homeSlide.findMany({ orderBy: { order: 'asc' } })
  const slides: HomeSlide[] = raw.map((s) => ({ ...s }))
  return <HomeEditor initialSlides={slides} />
}
