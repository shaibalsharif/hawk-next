import { prisma } from '@/lib/prisma'
import PortfolioEditor from '@/components/admin/PortfolioEditor'
import type { PortfolioCategory, PortfolioItem, PortfolioImage, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminPortfolioPage() {
  const raw = await prisma.portfolioCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      },
    },
  })

  type RawCat = typeof raw[number]
  type RawItem = RawCat['items'][number]
  type RawImg = RawItem['images'][number]

  const categories: PortfolioCategory[] = raw.map((cat: RawCat) => ({
    ...cat,
    imageMeta: cat.imageMeta as unknown as MediaMeta | null,
    items: cat.items.map((item: RawItem): PortfolioItem => ({
      ...item,
      coverMeta: item.coverMeta as unknown as MediaMeta | null,
      images: item.images.map((img: RawImg): PortfolioImage => ({
        ...img,
        imageMeta: img.imageMeta as unknown as MediaMeta,
      })),
    })),
  }))

  return <PortfolioEditor initialCategories={categories} />
}
