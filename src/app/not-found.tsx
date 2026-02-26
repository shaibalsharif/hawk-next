import { prisma } from '@/lib/prisma'
import NotFoundContent from './NotFoundContent'

export default async function NotFoundPage() {
  const slide = await prisma.homeSlide.findFirst({ orderBy: { order: 'asc' } })
  const bgUrl = slide
    ? `https://img.youtube.com/vi/${slide.videoId}/maxresdefault.jpg`
    : undefined

  return <NotFoundContent bgUrl={bgUrl} />
}
