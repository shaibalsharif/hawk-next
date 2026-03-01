import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { buildCustomResetUrl } from '@/lib/reset-link'
import { sendPasswordResetEmail } from '@/lib/mailer'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  await requireSuperAdmin()
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  let emailSent = false
  try {
    const resetUrl = await buildCustomResetUrl(email)
    await sendPasswordResetEmail(email, resetUrl)
    emailSent = true
  } catch (err) {
    console.error('[reset email]', err)
  }

  return NextResponse.json({ emailSent })
}
