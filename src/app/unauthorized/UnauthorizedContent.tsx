'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { auth, signOut } from '@/lib/firebase-client'

export default function UnauthorizedContent({ bgUrl }: { bgUrl?: string }) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

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

      {/* Radial glow behind content */}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-6 h-px bg-red-400/25" />
          <p className="text-red-400/50 text-[10px] font-oswald tracking-[0.4em] uppercase">Access Denied</p>
          <div className="w-6 h-px bg-red-400/25" />
        </div>

        <h1 className="text-white font-oswald text-5xl font-bold tracking-widest uppercase mb-2">403</h1>

        <div className="w-6 h-[2px] bg-yellow-2/40 mx-auto mb-6" />

        <p className="text-white/35 text-sm leading-relaxed mb-10">
          Your account doesn&apos;t have admin access.<br />
          Contact the site owner to request access.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignOut}
            className="w-full py-3.5 bg-yellow-2 text-dark-1 text-[10px] font-oswald tracking-[0.2em] uppercase rounded-xl hover:bg-yellow-2/90 transition-colors font-bold"
          >
            Sign Out
          </button>
          <a
            href="/"
            className="text-white/20 hover:text-white/50 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors py-2"
          >
            Return to site
          </a>
        </div>

        {/* Brand */}
        <p className="text-white/10 text-[10px] font-oswald tracking-widest uppercase mt-12">
          Hawk Creative Studios
        </p>
      </motion.div>

    </div>
  )
}
