import { cookies } from 'next/headers'
import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'
import type { SessionUser } from '@/types'

const SESSION_COOKIE_NAME = 'hawk_session'
const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!session) return null

    const decoded = await adminAuth.verifySessionCookie(session, true)
    const superadmin = await prisma.superAdmin.findUnique({ where: { uid: decoded.uid } })

    return {
      uid: decoded.uid,
      email: decoded.email,
      admin: decoded.admin === true,
      superadmin: superadmin !== null,
    }
  } catch {
    return null
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || !user.admin) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireSuperAdmin(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user || !user.superadmin) {
    throw new Error('Forbidden')
  }
  return user
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS }
