/**
 * Firebase Admin SDK — lazy initialization.
 * The SDK is intentionally NOT initialized at module load time so that
 * Next.js static-analysis / build passes even with placeholder env vars.
 * Actual initialization happens on first request that calls getAdminAuth().
 */
import type { Auth } from 'firebase-admin/auth'

let _auth: Auth | null = null

export function getAdminAuth(): Auth {
  if (_auth) return _auth

  // Dynamic requires keep this out of the static build graph
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initializeApp, getApps, cert } = require('firebase-admin/app')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getAuth } = require('firebase-admin/auth')

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        })

  _auth = getAuth(app)
  return _auth!
}

/**
 * Convenience proxy that behaves like the old `adminAuth` export.
 * Calling any method on it will trigger lazy init.
 */
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth()
    const val = (auth as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? val.bind(auth) : val
  },
})
