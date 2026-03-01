import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from '@/lib/auth'

export const runtime = 'nodejs'

const LOOPBACK = new Set(['::1', '127.0.0.1', 'localhost', 'unknown'])
const PRIVATE = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/

/** Returns a "City, Region, Country" string, or null if the IP is private/local. */
async function geolocate(ip: string): Promise<string | null> {
  if (LOOPBACK.has(ip) || PRIVATE.test(ip)) return 'Localhost'
  try {
    // ip-api.com free tier — HTTP only, server-side only, 100 req/min
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country`,
      { signal: AbortSignal.timeout(3000) },
    )
    const data = await res.json()
    if (data.status === 'success') {
      return [data.city, data.regionName, data.country].filter(Boolean).join(', ')
    }
  } catch { /* timeout or network error */ }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'No token' }, { status: 400 })

    const decoded = await adminAuth.verifyIdToken(idToken)

    if (!decoded.admin) {
      return NextResponse.json({ error: 'No admin claim' }, { status: 403 })
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    // Record login activity — must NOT block or break the login response
    try {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
      const device = req.headers.get('user-agent') ?? 'unknown'

      // Upsert IP + device immediately
      await prisma.adminLoginMeta.upsert({
        where: { uid: decoded.uid },
        create: { uid: decoded.uid, lastIp: ip, lastDevice: device, lastSeenAt: new Date() },
        update: { lastIp: ip, lastDevice: device, lastSeenAt: new Date() },
      })

      // Geolocation is slow — fire and forget, don't await
      geolocate(ip).then((location) => {
        if (location) {
          prisma.adminLoginMeta
            .update({ where: { uid: decoded.uid }, data: { lastLocation: location } })
            .catch(() => {})
        }
      }).catch(() => {})

    } catch {
      // Non-critical — login always succeeds even if activity logging fails
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    })
    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
