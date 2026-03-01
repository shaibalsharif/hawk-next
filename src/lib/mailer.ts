import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: Number(process.env.SMTP_PORT ?? 465) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const FROM = process.env.SMTP_FROM ?? 'Hawk Creative Studios <noreply@hawkcreativestudios.com>'
const YEAR = new Date().getFullYear()

function shell({
  title,
  body,
  buttonText,
  buttonUrl,
  note,
}: {
  title: string
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
</head>
<body style="margin:0;padding:0;background:#0d1214;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px 40px;">
        <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#111517;border-radius:10px 10px 0 0;padding:28px 44px;text-align:center;border-bottom:2px solid #fcda02;">
              <p style="margin:0 0 3px;font-size:8px;letter-spacing:0.55em;text-transform:uppercase;color:#fcda02;font-weight:700;">
                &#9670;&nbsp; HAWK CREATIVE STUDIOS &nbsp;&#9670;
              </p>
              <p style="margin:0;font-size:7px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25);">
                Admin Portal
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 44px 32px;">
              <h1 style="margin:0 0 18px;font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#111517;line-height:1.25;">
                ${title}
              </h1>
              <p style="margin:0 0 28px;font-size:14px;line-height:1.75;color:#555;">
                ${body}
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-radius:4px;background:#fcda02;">
                    <a href="${buttonUrl}"
                      style="display:inline-block;padding:14px 38px;color:#111517;text-decoration:none;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 4px;font-size:11px;color:#aaa;">
                If the button doesn&rsquo;t work, copy and paste this link:
              </p>
              <p style="margin:0 0 24px;font-size:11px;word-break:break-all;">
                <a href="${buttonUrl}" style="color:#888;text-decoration:underline;">${buttonUrl}</a>
              </p>

              ${note ? `
              <!-- Note -->
              <div style="background:#f9f5e0;border-left:3px solid #fcda02;border-radius:0 4px 4px 0;padding:10px 14px;">
                <p style="margin:0;font-size:11px;color:#665a00;">${note}</p>
              </div>` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f7f7;border-radius:0 0 10px 10px;padding:20px 44px;text-align:center;">
              <p style="margin:0 0 4px;font-size:10px;color:#aaa;">
                &copy; ${YEAR} Hawk Creative Studios. All rights reserved.
              </p>
              <p style="margin:0;font-size:9px;color:#ccc;">
                This email was sent to you because of an action taken on the Hawk Creative Studios admin portal.
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

/** Sent when a superadmin grants admin access to a new user. */
export async function sendAdminInviteEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `You've been granted admin access — Hawk Creative Studios`,
    html: shell({
      title: 'Admin Access Granted',
      body: `You&rsquo;ve been added as an <strong>admin</strong> to the Hawk Creative Studios website.<br><br>
             Click the button below to <strong>activate your account</strong> and set your password. This is your first-time setup link.`,
      buttonText: 'Activate My Account',
      buttonUrl: resetUrl,
      note: 'This link expires in 1 hour. If you weren&rsquo;t expecting this invitation, you can safely ignore this email.',
    }),
  })
}

/** Sent when an existing admin requests a password reset via "Reset Password" button. */
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Reset your password — Hawk Creative Studios`,
    html: shell({
      title: 'Reset Your Password',
      body: `We received a request to reset the password for your <strong>Hawk Creative Studios</strong> admin account.<br><br>
             Click the button below to choose a new password.`,
      buttonText: 'Reset Password',
      buttonUrl: resetUrl,
      note: 'This link expires in 1 hour. If you didn&rsquo;t request this, you can safely ignore this email.',
    }),
  })
}
