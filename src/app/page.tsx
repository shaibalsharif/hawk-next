import { prisma } from '@/lib/prisma'
import HeroSlider from '@/components/home/HeroSlider'
import type { HomeSlide } from '@/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const raw = await prisma.homeSlide.findMany({ orderBy: { order: 'asc' } })
  const slides: HomeSlide[] = raw.map((s: typeof raw[number]) => ({ ...s }))
  return <HeroSlider slides={slides} />
}
