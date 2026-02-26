import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PortfolioDetail from '@/components/portfolio/PortfolioDetail'
import Footer from '@/components/shared/Footer'
import type { PortfolioItem, PortfolioImage, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ category: string; id: string }>
}

export default async function PortfolioItemPage({ params }: Props) {
  const { id } = await params

  const raw = await prisma.portfolioItem.findUnique({
    where: { id },
    include: { images: { orderBy: { displayOrder: 'asc' } } },
  })

  if (!raw) notFound()

  const item: PortfolioItem = {
    id: raw.id,
    categoryId: raw.categoryId,
    title: raw.title,
    client: raw.client,
    year: raw.year,
    role: raw.role,
    coverMeta: raw.coverMeta as MediaMeta | null,
    description: raw.description,
    takeaways: raw.takeaways as string[],
    displayOrder: raw.displayOrder,
  }

  const images: PortfolioImage[] = raw.images.map((img: typeof raw.images[number]) => ({
    id: img.id,
    itemId: img.itemId,
    imageMeta: img.imageMeta as unknown as MediaMeta,
    displayOrder: img.displayOrder,
  }))

  return (
    <div>
      <PortfolioDetail item={item} images={images} />
      <Footer />
    </div>
  )
}
