import { NextRequest, NextResponse } from 'next/server'
import { sendFirebaseResetEmail } from '@/lib/firebase-email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    await sendFirebaseResetEmail(email)
  } catch {
    // Silently succeed — don't reveal whether the email exists
  }

  return NextResponse.json({ ok: true })
}
