import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PortfolioDetail from '@/components/portfolio/PortfolioDetail'
import Footer from '@/components/shared/Footer'
import type { PortfolioItem, PortfolioImage, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ category: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, id } = await params
  const item = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!item) return { title: 'Portfolio Item' }

  const cover = item.coverMeta as MediaMeta | null
  const description = item.description || `${item.title} — a visual project by Hawk Creative Studios.`
  const canonical = `https://hawk-beta.vercel.app/portfolio/${category}/${id}`

  return {
    title: item.title,
    description,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description,
      url: canonical,
      type: 'article',
      ...(cover ? { images: [{ url: cover.url, width: 1200, height: 630, alt: item.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description,
      ...(cover ? { images: [cover.url] } : {}),
    },
  }
}

export default async function PortfolioItemPage({ params }: Props) {
  const { category, id } = await params

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

  const images: PortfolioImage[] = raw.images
    .filter((img: typeof raw.images[number]) => !img.hidden)
    .map((img: typeof raw.images[number]) => ({
      id: img.id,
      itemId: img.itemId,
      imageMeta: img.imageMeta as unknown as MediaMeta,
      displayOrder: img.displayOrder,
      hidden: img.hidden,
      colSpan: img.colSpan,
      rowSpan: img.rowSpan,
      objectFit: img.objectFit,
      objectPosition: img.objectPosition,
      thumbMeta: img.thumbMeta as MediaMeta | null ?? null,
    }))

  const cover = item.coverMeta as MediaMeta | null
  const creativeWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.title,
    description: item.description || undefined,
    creator: { '@type': 'Organization', name: 'Hawk Creative Studios' },
    dateCreated: String(item.year),
    url: `https://hawk-beta.vercel.app/portfolio/${category}/${id}`,
    ...(cover ? { image: cover.url } : {}),
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkSchema) }}
      />
      <PortfolioDetail item={item} images={images} />
      <Footer />
    </div>
  )
}
