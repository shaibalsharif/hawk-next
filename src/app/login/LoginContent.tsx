'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '@/lib/firebase-client'

type Tab = 'google' | 'email'
type View = 'login' | 'forgot'

export default function LoginContent({ bgUrl }: { bgUrl?: string }) {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/admin'

  const [tab, setTab] = useState<Tab>('google')
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const verifyAndRedirect = async (idToken: string) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    if (res.status === 403) {
      await auth.signOut()
      router.push('/unauthorized')
      return
    }
    if (!res.ok) throw new Error('Verification failed')
    router.push(from)
  }

  const signInGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const token = await cred.user.getIdToken()
      await verifyAndRedirect(token)
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // silent — user dismissed
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked — allow popups for this site and try again.')
      } else if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorised in Firebase. Add it under Authentication → Authorized Domains.')
      } else if (code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Enable it in Firebase Console → Sign-in methods.')
      } else if (code === 'auth/account-exists-with-different-credential') {
        setError('An account exists with this email using a different sign-in method. Use the Email tab instead.')
      } else {
        setError(e instanceof Error ? e.message : 'Google sign-in failed.')
      }
      setLoading(false)
    }
  }

  const signInEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const token = await cred.user.getIdToken()
      await verifyAndRedirect(token)
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-login-credentials'
      ) {
        setError('Incorrect email or password.')
      } else if (code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (code === 'auth/user-disabled') {
        setError('This account has been disabled. Contact the site owner.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later or reset your password.')
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else {
        setError('Sign-in failed. Please try again.')
      }
      setLoading(false)
    }
  }

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setResetSent(true)
    } catch {
      setError('Could not send reset email — check the address.')
    }
    setLoading(false)
  }

  return (
    <div className="native-cursor min-h-screen flex bg-dark-1">

      {/* ── Left / form panel ─────────────────────────────────── */}
      <div className="relative z-10 flex flex-col w-full md:w-[480px] lg:w-[520px] flex-shrink-0 min-h-screen">

        {/* Mobile: faint background behind form */}
        {bgUrl && (
          <div className="md:hidden absolute inset-0 -z-10 overflow-hidden">
            <img src={bgUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-dark-1/90" />
          </div>
        )}

        {/* Back to site */}
        <div className="px-10 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/25 hover:text-white/60 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to site
          </Link>
        </div>

        {/* Brand */}
        <div className="px-10 pt-14 pb-10">
          <p className="text-yellow-2 text-[10px] font-oswald tracking-[0.45em] uppercase mb-3">Hawk Creative Studios</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-white font-oswald text-[2.2rem] font-bold tracking-wide uppercase leading-tight"
            >
              {view === 'forgot' ? 'Reset\nPassword' : 'Admin\nPortal'}
            </motion.h1>
          </AnimatePresence>
          <div className="w-8 h-[2px] bg-yellow-2 mt-5" />
        </div>

        {/* Form area */}
        <div className="flex-1 px-10 pb-10">
          <AnimatePresence mode="wait">
            {/* ── Forgot password ── */}
            {view === 'forgot' ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.22 }}
              >
                {resetSent ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-oswald tracking-wider">Email sent</p>
                        <p className="text-white/35 text-xs mt-0.5">Check your inbox for the reset link.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setView('login'); setResetSent(false) }}
                      className="text-yellow-2/60 hover:text-yellow-2 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors"
                    >
                      ← Back to login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={forgotPassword} className="space-y-5">
                    <p className="text-white/30 text-sm leading-relaxed">
                      Enter your admin email and we&apos;ll send a link to reset your password.
                    </p>
                    <div>
                      <label className="block text-[10px] text-white/30 font-oswald tracking-[0.2em] uppercase mb-2">
                        Email Address
                      </label>
                      <input
                        type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-dark-2/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-2/50 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                    {error && (
                      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        <p className="text-red-400 text-xs font-oswald tracking-wider">{error}</p>
                      </div>
                    )}
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 bg-yellow-2 text-dark-1 text-[10px] font-oswald tracking-[0.2em] uppercase rounded-xl hover:bg-yellow-2/90 transition-colors disabled:opacity-50 font-bold">
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                    <button type="button" onClick={() => { setView('login'); setError('') }}
                      className="w-full text-white/25 hover:text-white/50 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors py-2">
                      ← Back to login
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* ── Login ── */
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                {/* Tab switcher */}
                <div className="flex bg-dark-2/60 border border-white/5 rounded-xl p-1 gap-1">
                  {(['google', 'email'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError('') }}
                      className={`flex-1 py-2.5 text-[10px] font-oswald tracking-[0.12em] uppercase rounded-lg transition-all ${
                        tab === t
                          ? 'bg-yellow-2 text-dark-1 font-bold shadow-sm'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {t === 'google' ? 'Google' : 'Email / Password'}
                    </button>
                  ))}
                </div>

                {/* Tab panels */}
                <AnimatePresence mode="wait">
                  {tab === 'google' ? (
                    <motion.div
                      key="g"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <p className="text-white/20 text-xs text-center font-oswald tracking-wider">
                        Sign in with your Google account
                      </p>
                      <button
                        onClick={signInGoogle}
                        disabled={loading}
                        className="w-full py-3.5 bg-white text-dark-1 text-[10px] font-oswald tracking-[0.15em] uppercase rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 font-bold shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {loading ? 'Signing in…' : 'Continue with Google'}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="e"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      onSubmit={signInEmail}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] text-white/30 font-oswald tracking-[0.2em] uppercase mb-2">Email</label>
                        <input
                          type="email" required value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-dark-2/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-2/50 transition-colors"
                          placeholder="you@example.com"
                          autoComplete="email"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-white/30 font-oswald tracking-[0.2em] uppercase mb-2">Password</label>
                        <input
                          type="password" required value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-dark-2/70 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-2/50 transition-colors"
                          placeholder="••••••••"
                          autoComplete="current-password"
                        />
                      </div>
                      <button
                        type="submit" disabled={loading}
                        className="w-full py-3.5 bg-yellow-2 text-dark-1 text-[10px] font-oswald tracking-[0.2em] uppercase rounded-xl hover:bg-yellow-2/90 transition-colors disabled:opacity-50 font-bold"
                      >
                        {loading ? 'Signing in…' : 'Sign In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setError('') }}
                        className="w-full text-white/20 hover:text-white/50 text-[10px] font-oswald tracking-[0.2em] uppercase transition-colors py-1"
                      >
                        Forgot password?
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Error banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                      </svg>
                      <p className="text-red-400 text-xs font-oswald tracking-wider leading-relaxed">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-10 pb-8">
          <p className="text-white/12 text-[10px] font-oswald tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Hawk Creative Studios
          </p>
        </div>
      </div>

      {/* ── Right panel — cinematic background ─────────────────── */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        {bgUrl ? (
          <motion.img
            src={bgUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.07 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: 'linear' }}
          />
        ) : (
          <div className="absolute inset-0 bg-dark-2" />
        )}
        {/* Blend gradient from left panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-1 via-dark-1/15 to-transparent" />
        {/* Bottom darkening */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-1/60 via-transparent to-transparent" />
        {/* Brand watermark */}
        <div className="absolute bottom-10 right-10 text-right pointer-events-none select-none">
          <p className="text-white/10 font-oswald font-bold text-8xl uppercase tracking-widest leading-none">HAWK</p>
          <p className="text-white/8 text-[10px] font-oswald tracking-[0.5em] uppercase mt-1">Creative Studios</p>
        </div>
      </div>

    </div>
  )
}
