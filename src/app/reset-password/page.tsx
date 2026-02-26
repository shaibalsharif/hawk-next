'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { auth, confirmPasswordReset, verifyPasswordResetCode } from '@/lib/firebase-client'

const XEN_EASE = [0.76, 0, 0.24, 1] as const

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const oobCode = params.get('oobCode') ?? ''

  const [status, setStatus] = useState<'verifying' | 'ready' | 'invalid' | 'success'>('verifying')
  const [emailForCode, setEmailForCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!oobCode) { setStatus('invalid'); return }
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => { setEmailForCode(email); setStatus('ready') })
      .catch(() => setStatus('invalid'))
  }, [oobCode])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setStatus('success')
      setTimeout(() => router.push('/login'), 3000)
    } catch (e: unknown) {
      const code = (e as { code?: string }).code
      if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
        setError('This link has expired or already been used. Please request a new one.')
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak — please use at least 8 characters.')
      } else {
        setError('Failed to reset password. Please try again.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="native-cursor min-h-screen bg-dark-1 flex items-center justify-center p-4 relative">
      {/* Go Home */}
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-oswald tracking-wider uppercase transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: XEN_EASE }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <p className="section-label mb-3">Hawk Creative Studios</p>
          <h1 className="section-title text-3xl text-white">
            {status === 'success' ? 'Password Updated' : 'Reset Password'}
          </h1>
        </div>

        <div className="bg-dark-2 rounded-lg p-6 space-y-5">
          {/* Verifying */}
          {status === 'verifying' && (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-yellow-2/30 border-t-yellow-2 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-xs font-oswald tracking-wider uppercase">Verifying link…</p>
            </div>
          )}

          {/* Invalid / expired */}
          {status === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm font-oswald tracking-wider">Invalid or expired link</p>
              <p className="text-white/40 text-xs">This reset link has expired or already been used.</p>
              <Link href="/login" className="block text-center xen-btn text-white w-full">
                Back to Login
              </Link>
            </div>
          )}

          {/* Reset form */}
          {status === 'ready' && (
            <form onSubmit={handleReset} className="space-y-4">
              {emailForCode && (
                <p className="text-xs text-white/40 text-center">
                  Setting password for <span className="text-white/70">{emailForCode}</span>
                </p>
              )}

              <div>
                <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-dark-3 border border-white/20 rounded px-3 py-2.5 pr-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-dark-3 border border-white/20 rounded px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>

              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      i < Math.min(4, Math.floor(password.length / 3))
                        ? password.length >= 12 ? 'bg-green-400' : password.length >= 8 ? 'bg-yellow-2' : 'bg-red-400'
                        : 'bg-white/10'
                    }`} />
                  ))}
                </div>
              )}

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating…' : 'Set New Password'}
              </button>
            </form>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-green-400 text-sm font-oswald tracking-wider">Password updated!</p>
              <p className="text-white/40 text-xs">Redirecting you to the login page…</p>
              <Link href="/login" className="block text-center text-xs text-white/40 hover:text-white transition-colors font-oswald tracking-wider uppercase">
                Go to Login →
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-1" />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
