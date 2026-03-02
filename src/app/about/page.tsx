import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import AboutCover from '@/components/about/AboutCover'
import TeamMembers from '@/components/about/TeamMembers'
import WikiSection from '@/components/about/WikiSection'
import Footer from '@/components/shared/Footer'
import type { AboutCover as AboutCoverType, AboutInner, TeamMember, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Meet the team behind Hawk Creative Studios — passionate visual storytellers specializing in FPV cinematography and aerial photography.',
  alternates: { canonical: 'https://hawk-beta.vercel.app/about' },
  openGraph: {
    title: 'About Us',
    description: 'Meet the team behind Hawk Creative Studios — passionate visual storytellers specializing in FPV cinematography and aerial photography.',
    url: 'https://hawk-beta.vercel.app/about',
  },
}

export default async function AboutPage() {
  const [rawCover, rawInner, rawMembers] = await Promise.all([
    prisma.aboutCover.findUnique({ where: { id: 'singleton' } }),
    prisma.aboutInner.findUnique({ where: { id: 'singleton' } }),
    prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: AboutCoverType | null = rawCover
    ? {
        title: rawCover.title,
        sub: rawCover.sub,
        points: rawCover.points as string[],
        imageMeta: rawCover.imageMeta as MediaMeta | null,
      }
    : null

  const inner: AboutInner | null = rawInner
    ? { title: rawInner.title, description: rawInner.description }
    : null

  const members: TeamMember[] = rawMembers.map((m: typeof rawMembers[number]) => ({
    id: m.id,
    name: m.name,
    position: m.position,
    imageMeta: m.imageMeta as MediaMeta | null,
    displayOrder: m.displayOrder,
  }))

  return (
    <div>
      <AboutCover data={cover} />

      {inner && (
        <div className="min-h-[60vh] w-full bg-dark-1 flex flex-col md:flex-row items-start justify-center md:items-center md:justify-between px-8 md:px-[10%] py-24 gap-8">
          <h2 className="text-yellow-2 text-[clamp(1.4rem,3vw,2rem)] tracking-[2px] font-[500] uppercase md:w-[30%]">
            {inner.title}
          </h2>
          <p className="text-sm font-[400] leading-relaxed md:w-[60%] text-justify text-white/80">
            &ldquo;{inner.description}&rdquo;
          </p>
        </div>
      )}

      <TeamMembers members={members} />
      <WikiSection />
      <Footer />
    </div>
  )
}
