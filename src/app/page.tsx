import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import HeroSlider from '@/components/home/HeroSlider'
import type { HomeSlide } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hawk Creative Studios — FPV Cinematography & Aerial Photography',
  description: 'Hawk Creative Studios creates immersive visual stories through FPV cinematography, aerial photography, and drone videography.',
  alternates: { canonical: 'https://hawk-beta.vercel.app' },
  openGraph: {
    title: 'Hawk Creative Studios — FPV Cinematography & Aerial Photography',
    description: 'Hawk Creative Studios creates immersive visual stories through FPV cinematography, aerial photography, and drone videography.',
    url: 'https://hawk-beta.vercel.app',
  },
}

export default async function HomePage() {
  const raw = await prisma.homeSlide.findMany({ orderBy: { order: 'asc' } })
  const slides: HomeSlide[] = raw.map((s: typeof raw[number]) => ({ ...s }))
  return <HeroSlider slides={slides} />
}
