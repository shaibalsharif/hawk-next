import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const user = await getSessionUser()

  const [slides, members, services, categories, contacts] = await Promise.all([
    prisma.homeSlide.count(),
    prisma.teamMember.count(),
    prisma.serviceItem.count(),
    prisma.portfolioCategory.count(),
    prisma.contactItem.count(),
  ])

  const stats = [
    { label: 'Home Slides', value: slides, href: '/admin/home' },
    { label: 'Team Members', value: members, href: '/admin/about' },
    { label: 'Services', value: services, href: '/admin/services' },
    { label: 'Portfolio Categories', value: categories, href: '/admin/portfolio' },
    { label: 'Contact Items', value: contacts, href: '/admin/contact' },
  ]

  const sections = [
    { label: 'Home Slides', desc: 'Edit YouTube videos in the hero carousel', href: '/admin/home' },
    { label: 'About', desc: 'Cover text, story, and team members', href: '/admin/about' },
    { label: 'Services', desc: 'Cover, inner page, service list, clients', href: '/admin/services' },
    { label: 'Portfolio', desc: 'Categories and portfolio items with gallery', href: '/admin/portfolio' },
    { label: 'Contact', desc: 'Contact details and social media links', href: '/admin/contact' },
    { label: 'Users', desc: 'Manage admin access and password resets', href: '/admin/users' },
  ]

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <p className="section-label mb-2">Welcome back</p>
        <h1 className="section-title text-3xl text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-2">{user?.email}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-dark-2 rounded-lg p-4 hover:border-yellow-2/30 border border-white/10 transition-colors group"
          >
            <p className="text-2xl font-oswald font-bold text-yellow-2">{s.value}</p>
            <p className="text-white/40 text-xs font-oswald tracking-wider uppercase mt-1 group-hover:text-white/70 transition-colors">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Section cards */}
      <div>
        <h2 className="text-sm font-oswald tracking-widest uppercase text-white/40 mb-4">Manage Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sections.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="bg-dark-2 border border-white/10 hover:border-yellow-2/40 rounded-lg p-5 transition-all group"
            >
              <h3 className="font-oswald text-white tracking-wider uppercase text-sm group-hover:text-yellow-2 transition-colors">{s.label}</h3>
              <p className="text-white/40 text-xs mt-2 leading-relaxed">{s.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-yellow-2/50 group-hover:text-yellow-2 text-xs font-oswald tracking-widest uppercase transition-colors">
                Manage
                <svg className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
