import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ItemGrid from '@/components/portfolio/ItemGrid'
import type { PortfolioItem, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params

  const cat = await prisma.portfolioCategory.findFirst({
    where: { id: { equals: category, mode: 'insensitive' } },
  })

  if (!cat) notFound()

  const raw = await prisma.portfolioItem.findMany({
    where: { categoryId: cat.id },
    orderBy: { displayOrder: 'asc' },
  })

  const items: PortfolioItem[] = raw.map((i: typeof raw[number]) => ({
    id: i.id,
    categoryId: i.categoryId,
    title: i.title,
    client: i.client,
    year: i.year,
    role: i.role,
    coverMeta: i.coverMeta as MediaMeta | null,
    description: i.description,
    takeaways: i.takeaways as string[],
    displayOrder: i.displayOrder,
  }))

  return (
    <div className="overflow-x-hidden">
      <ItemGrid items={items} categorySlug={category} />
    </div>
  )
}
