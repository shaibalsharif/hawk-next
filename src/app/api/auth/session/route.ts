import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { SESSION_COOKIE_NAME } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })
  return NextResponse.json({ user })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return res
}
