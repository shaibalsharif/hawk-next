import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ItemGrid from '@/components/portfolio/ItemGrid'
import type { PortfolioItem, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  const cat = await prisma.portfolioCategory.findFirst({
    where: { id: { equals: category, mode: 'insensitive' } },
  })
  if (!cat) return { title: 'Portfolio' }

  const cover = cat.imageMeta as MediaMeta | null
  const description = cat.details || `Explore ${cat.name} work by Hawk Creative Studios — visual storytellers specializing in FPV cinematography and aerial photography.`

  return {
    title: cat.name,
    description,
    alternates: { canonical: `https://hawk-beta.vercel.app/portfolio/${category}` },
    openGraph: {
      title: cat.name,
      description,
      url: `https://hawk-beta.vercel.app/portfolio/${category}`,
      ...(cover ? { images: [{ url: cover.url, width: 1200, height: 630, alt: cat.name }] } : {}),
    },
  }
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
