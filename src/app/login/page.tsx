import type { Metadata } from 'next'
import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import LoginContent from './LoginContent'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const slide = await prisma.homeSlide.findFirst({ orderBy: { order: 'asc' } })
  const bgUrl = slide
    ? `https://img.youtube.com/vi/${slide.videoId}/maxresdefault.jpg`
    : undefined

  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-1" />}>
      <LoginContent bgUrl={bgUrl} />
    </Suspense>
  )
}
