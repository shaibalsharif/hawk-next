import { prisma } from '@/lib/prisma'
import UnauthorizedContent from './UnauthorizedContent'

export const dynamic = 'force-dynamic'

export default async function UnauthorizedPage() {
  const slide = await prisma.homeSlide.findFirst({ orderBy: { order: 'asc' } })
  const bgUrl = slide
    ? `https://img.youtube.com/vi/${slide.videoId}/maxresdefault.jpg`
    : undefined

  return <UnauthorizedContent bgUrl={bgUrl} />
}
