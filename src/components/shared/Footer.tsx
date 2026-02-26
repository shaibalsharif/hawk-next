import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-dark-1 border-t border-white/10 py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Brand */}
        <div>
          <Image src="/images/logo.png" alt="Hawk" width={140} height={56} className="h-8 w-auto object-contain mb-4" />
          <p className="text-white/40 text-xs tracking-widest uppercase font-oswald">
            We create visual stories
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-2">
          {[
            { label: 'Home', href: '/' },
            { label: 'About', href: '/about' },
            { label: 'Services', href: '/services' },
            { label: 'Portfolio', href: '/portfolio' },
            { label: 'Contact', href: '/contact' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-white/50 hover:text-yellow-2 transition-colors text-xs tracking-widest uppercase font-oswald"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social */}
        <div className="flex flex-col gap-2">
          {['Instagram', 'Facebook', 'Vimeo', 'Behance', 'YouTube'].map((s) => (
            <span
              key={s}
              className="text-white/30 hover:text-yellow-2 transition-colors text-xs tracking-widest uppercase font-oswald cursor-pointer"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
        <span className="text-white/20 text-xs font-oswald tracking-widest uppercase">
          © {new Date().getFullYear()} Hawk Creative Studios
        </span>
        <Link
          href="/admin"
          className="text-white/10 hover:text-white/30 transition-colors text-xs font-oswald tracking-widest uppercase"
        >
          Admin
        </Link>
      </div>
    </footer>
  )
}
