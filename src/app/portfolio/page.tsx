import { prisma } from '@/lib/prisma'
import CategoryGrid from '@/components/portfolio/CategoryGrid'
import type { PortfolioCategory, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

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
