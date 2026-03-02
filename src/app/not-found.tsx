import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import NotFoundContent from './NotFoundContent'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default async function NotFoundPage() {
  const slide = await prisma.homeSlide.findFirst({ orderBy: { order: 'asc' } })
  const bgUrl = slide
    ? `https://img.youtube.com/vi/${slide.videoId}/maxresdefault.jpg`
    : undefined

  return <NotFoundContent bgUrl={bgUrl} />
}
