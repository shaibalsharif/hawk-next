import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import CategoryGrid from '@/components/portfolio/CategoryGrid'
import type { PortfolioCategory, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Browse the Hawk Creative Studios portfolio — stunning FPV cinematography, aerial photography, and visual storytelling across every category.',
  alternates: { canonical: 'https://hawk-beta.vercel.app/portfolio' },
  openGraph: {
    title: 'Portfolio',
    description: 'Browse the Hawk Creative Studios portfolio — stunning FPV cinematography, aerial photography, and visual storytelling across every category.',
    url: 'https://hawk-beta.vercel.app/portfolio',
  },
}

export default async function PortfolioPage() {
  const raw = await prisma.portfolioCategory.findMany({
    orderBy: { displayOrder: 'asc' },
  })

  const categories: PortfolioCategory[] = raw.map((c: typeof raw[number]) => ({
    id: c.id,
    name: c.name,
    details: c.details,
    imageMeta: c.imageMeta as MediaMeta | null,
    displayOrder: c.displayOrder,
  }))

  return (
    <div className="overflow-x-hidden">
      <CategoryGrid categories={categories} />
    </div>
  )
}
