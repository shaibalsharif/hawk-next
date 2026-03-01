/**
 * Sends a password reset email via Firebase's own email infrastructure.
 * No third-party email service needed — Firebase handles delivery and templating.
 *
 * To make the link in the email point to your custom /reset-password page:
 *   Firebase Console → Authentication → Templates → Password Reset
 *   → Edit template → Customize action URL → set to your app URL + /reset-password
 *   e.g. http://localhost:3000/reset-password  (dev)
 *       https://yourdomain.com/reset-password  (prod)
 */
export async function sendFirebaseResetEmail(email: string): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is not set')

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: 'PASSWORD_RESET', email }),
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error?.message ?? 'Firebase failed to send email')
  }
}
