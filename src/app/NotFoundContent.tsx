'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFoundContent({ bgUrl }: { bgUrl?: string }) {
  return (
    <div className="native-cursor min-h-screen relative flex items-center justify-center bg-dark-1 overflow-hidden">

      {/* Background */}
      {bgUrl && (
        <>
          <motion.img
            src={bgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 16, ease: 'linear' }}
          />
          <div className="absolute inset-0 bg-dark-1/88" />
        </>
      )}

      {/* Yellow radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(252,218,2,0.05)_0%,transparent_70%)]" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="relative z-10 text-center max-w-sm w-full px-6"
      >
        {/* Icon — map marker with question mark vibe */}
        <div className="w-20 h-20 rounded-full bg-yellow-2/8 border border-yellow-2/15 flex items-center justify-center mx-auto mb-8">
          <svg className="w-9 h-9 text-yellow-2/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-px bg-yellow-2/25" />
          <p className="text-yellow-2/50 text-[10px] font-oswald tracking-[0.4em] uppercase">Page Not Found</p>
          <div className="w-6 h-px bg-yellow-2/25" />
        </div>

        <h1 className="text-white font-oswald text-5xl font-bold tracking-widest uppercase mb-2">404</h1>

        <div className="w-6 h-[2px] bg-yellow-2/40 mx-auto mb-6" />

        <p className="text-white/35 text-sm leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist<br />
          or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full py-3.5 bg-yellow-2 text-dark-1 text-[10px] font-oswald tracking-[0.2em] uppercase rounded-xl hover:bg-yellow-2/90 transition-colors font-bold text-center"
          >
            Back to Home
          </Link>
          <Link
            href="/portfolio"
            className="text-white/20 hover:text-white/50 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors py-2"
          >
            View Portfolio
          </Link>
        </div>

        {/* Brand */}
        <p className="text-white/10 text-[10px] font-oswald tracking-widest uppercase mt-12">
          Hawk Creative Studios
        </p>
      </motion.div>

    </div>
  )
}
