'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="native-cursor min-h-screen relative flex items-center justify-center bg-dark-1 overflow-hidden">

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 60px)',
        }}
      />

      {/* Red radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.06)_0%,transparent_70%)]" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="relative z-10 text-center max-w-sm w-full px-6"
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/8 border border-red-500/15 flex items-center justify-center mx-auto mb-8">
          <svg className="w-9 h-9 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-px bg-red-400/25" />
          <p className="text-red-400/50 text-[10px] font-oswald tracking-[0.4em] uppercase">Something Went Wrong</p>
          <div className="w-6 h-px bg-red-400/25" />
        </div>

        <h1 className="text-white font-oswald text-5xl font-bold tracking-widest uppercase mb-2">500</h1>

        <div className="w-6 h-[2px] bg-yellow-2/40 mx-auto mb-6" />

        <p className="text-white/35 text-sm leading-relaxed mb-10">
          An unexpected error occurred.<br />
          {error.digest && (
            <span className="text-white/20 text-xs font-mono block mt-1">
              ref: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full py-3.5 bg-yellow-2 text-dark-1 text-[10px] font-oswald tracking-[0.2em] uppercase rounded-xl hover:bg-yellow-2/90 transition-colors font-bold"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="text-white/20 hover:text-white/50 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors py-2"
          >
            Return to Home
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
