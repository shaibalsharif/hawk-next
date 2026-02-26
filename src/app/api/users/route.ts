import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { requireSuperAdmin } from '@/lib/auth'
import { buildCustomResetUrl } from '@/lib/reset-link'
import { sendAdminInviteEmail } from '@/lib/email'

export const runtime = 'nodejs'

// List all admin users (users with admin custom claim)
export async function GET() {
  await requireSuperAdmin()
  const list = await adminAuth.listUsers(1000)
  const admins = list.users
    .filter((u) => u.customClaims?.admin === true)
    .map((u) => ({
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      disabled: u.disabled,
    }))
  return NextResponse.json(admins)
}

// Add admin by email — creates user if needed, sets admin claim, sends invite email
export async function POST(req: NextRequest) {
  await requireSuperAdmin()
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  let uid: string
  let isNewUser = false

  try {
    const existing = await adminAuth.getUserByEmail(email)
    uid = existing.uid
  } catch {
    // User doesn't exist — create with a temp password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!'
    const created = await adminAuth.createUser({ email, password: tempPassword })
    uid = created.uid
    isNewUser = true
  }

  await adminAuth.setCustomUserClaims(uid, { admin: true })

  // Send invite email with password-set link (always, whether new or existing)
  try {
    const resetUrl = await buildCustomResetUrl(email)
    await sendAdminInviteEmail(email, resetUrl)
  } catch (err) {
    console.error('[invite email]', err)
    // Don't fail the whole request if email fails — admin was still created
  }

  const user = await adminAuth.getUser(uid)
  return NextResponse.json({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    disabled: user.disabled,
    isNewUser,
  }, { status: 201 })
}

// Remove admin claim
export async function DELETE(req: NextRequest) {
  await requireSuperAdmin()
  const { uid } = await req.json()
  if (!uid) return NextResponse.json({ error: 'UID required' }, { status: 400 })
  await adminAuth.setCustomUserClaims(uid, { admin: false })
  return NextResponse.json({ ok: true })
}
