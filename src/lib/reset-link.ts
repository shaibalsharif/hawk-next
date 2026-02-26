import { adminAuth } from './firebase-admin'

/**
 * Generates a Firebase password-reset link, extracts the oobCode,
 * and returns a URL pointing to our custom /reset-password page.
 */
export async function buildCustomResetUrl(email: string): Promise<string> {
  const firebaseLink = await adminAuth.generatePasswordResetLink(email)
  const oobCode = new URL(firebaseLink).searchParams.get('oobCode')
  if (!oobCode) throw new Error('Failed to extract oobCode from Firebase reset link')

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/reset-password?oobCode=${encodeURIComponent(oobCode)}`
}
