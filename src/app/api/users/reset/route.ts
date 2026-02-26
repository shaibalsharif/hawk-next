import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth'
import { buildCustomResetUrl } from '@/lib/reset-link'
import { sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  await requireSuperAdmin()
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const resetUrl = await buildCustomResetUrl(email)

  let emailSent = false
  try {
    await sendPasswordResetEmail(email, resetUrl)
    emailSent = true
  } catch (err) {
    console.error('[reset email]', err)
  }

  // Always return the link so admin can share it manually if email fails
  return NextResponse.json({ link: resetUrl, emailSent })
}
