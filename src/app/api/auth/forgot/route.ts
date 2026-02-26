import { NextRequest, NextResponse } from 'next/server'
import { buildCustomResetUrl } from '@/lib/reset-link'
import { sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const resetUrl = await buildCustomResetUrl(email)
    await sendPasswordResetEmail(email, resetUrl)
  } catch {
    // Always return success to avoid revealing whether an email exists
  }

  return NextResponse.json({ ok: true })
}
