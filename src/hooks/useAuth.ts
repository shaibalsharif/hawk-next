'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  auth,
  onAuthStateChanged,
  signOut,
  type User,
} from '@/lib/firebase-client'

interface AuthState {
  user: User | null
  loading: boolean
  isAdmin: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
    error: null,
  })

  const verifyAndCreateSession = useCallback(async (user: User) => {
    try {
      const idToken = await user.getIdToken(true)
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })

      if (res.ok) {
        setState({ user, loading: false, isAdmin: true, error: null })
        return true
      } else if (res.status === 403) {
        await signOut(auth)
        setState({ user: null, loading: false, isAdmin: false, error: 'unauthorized' })
        return false
      } else {
        throw new Error('Verification failed')
      }
    } catch (err) {
      setState({ user: null, loading: false, isAdmin: false, error: 'error' })
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    await fetch('/api/auth/session', { method: 'DELETE' })
    setState({ user: null, loading: false, isAdmin: false, error: null })
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await verifyAndCreateSession(user)
      } else {
        setState({ user: null, loading: false, isAdmin: false, error: null })
      }
    })
    return unsub
  }, [verifyAndCreateSession])

  return { ...state, verifyAndCreateSession, logout }
}
