import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@hawkcreativestudios.com'
const BRAND = 'Hawk Creative Studios'
const YEAR = new Date().getFullYear()

function baseTemplate({
  title,
  preheader,
  body,
  buttonText,
  buttonUrl,
  note,
}: {
  title: string
  preheader: string
  body: string
  buttonText: string
  buttonUrl: string
  note?: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <!--[if !mso]><!-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap');
  </style>
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#0d1214;font-family:Arial,Helvetica,sans-serif;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#0d1214;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#0d1214;">
    <tr>
      <td align="center" style="padding:48px 16px 40px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;">

          <!-- ─── Header ─── -->
          <tr>
            <td style="background:#111517;border-radius:12px 12px 0 0;padding:36px 48px 32px;text-align:center;border-bottom:2px solid #fcda02;">
              <p style="margin:0 0 4px;font-size:9px;letter-spacing:0.5em;text-transform:uppercase;color:#fcda02;font-family:Arial,sans-serif;font-weight:700;">
                ◆ &nbsp;Hawk Creative Studios&nbsp; ◆
              </p>
              <p style="margin:0;font-size:8px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.25);font-family:Arial,sans-serif;">
                Admin Portal
              </p>
            </td>
          </tr>

          <!-- ─── Body ─── -->
          <tr>
            <td style="background:#ffffff;padding:44px 48px 36px;">
              <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#111517;line-height:1.2;font-family:Arial,sans-serif;">
                ${title}
              </h1>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#444;font-family:Arial,sans-serif;">
                ${body}
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="border-radius:4px;background:#fcda02;">
                    <a href="${buttonUrl}"
                      style="display:inline-block;padding:15px 40px;color:#111517;text-decoration:none;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:0.18em;font-family:Arial,sans-serif;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:28px 0 0;font-size:12px;color:#aaa;font-family:Arial,sans-serif;">
                If the button doesn&rsquo;t work, copy and paste this link:
              </p>
              <p style="margin:6px 0 0;font-size:11px;word-break:break-all;font-family:Arial,monospace;">
                <a href="${buttonUrl}" style="color:#888;text-decoration:underline;">${buttonUrl}</a>
              </p>

              ${note ? `
              <!-- Note -->
              <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:28px;width:100%;">
                <tr>
                  <td style="background:#f9f5e0;border-left:3px solid #fcda02;border-radius:0 4px 4px 0;padding:12px 16px;">
                    <p style="margin:0;font-size:12px;color:#665a00;font-family:Arial,sans-serif;">${note}</p>
                  </td>
                </tr>
              </table>` : ''}
            </td>
          </tr>

          <!-- ─── Divider ─── -->
          <tr>
            <td style="background:#ffffff;padding:0 48px;">
              <div style="border-top:1px solid #eee;"></div>
            </td>
          </tr>

          <!-- ─── Footer ─── -->
          <tr>
            <td style="background:#f7f7f7;border-radius:0 0 12px 12px;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;color:#aaa;font-family:Arial,sans-serif;">
                &copy; ${YEAR} ${BRAND}. All rights reserved.
              </p>
              <p style="margin:0;font-size:10px;color:#ccc;font-family:Arial,sans-serif;">
                This email was sent to you because you have an account on the ${BRAND} admin portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendAdminInviteEmail(email: string, resetUrl: string) {
  const html = baseTemplate({
    title: 'Admin Access Granted',
    preheader: `You've been added as an admin to ${BRAND}. Set your password to get started.`,
    body: `You&rsquo;ve been granted admin access to the <strong>${BRAND}</strong> website. Click the button below to set your password and sign in for the first time.`,
    buttonText: 'Set Your Password',
    buttonUrl: resetUrl,
    note: 'This link expires in 1 hour. If you weren&rsquo;t expecting this invitation, you can safely ignore this email.',
  })

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `You've been added as an admin — ${BRAND}`,
    html,
  })

  if (error) throw new Error(error.message)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const html = baseTemplate({
    title: 'Reset Your Password',
    preheader: `Password reset requested for your ${BRAND} admin account.`,
    body: `We received a request to reset the password for your <strong>${BRAND}</strong> admin account. Click the button below to choose a new password.`,
    buttonText: 'Reset Password',
    buttonUrl: resetUrl,
    note: 'This link expires in 1 hour. If you didn&rsquo;t request a password reset, you can safely ignore this email &mdash; your password won&rsquo;t change.',
  })

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Reset your password — ${BRAND}`,
    html,
  })

  if (error) throw new Error(error.message)
}
