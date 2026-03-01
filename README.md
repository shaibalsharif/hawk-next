# Hawk Creative Studios — Next.js Website & Admin CMS

A full-stack Next.js 16 website and content management system for Hawk Creative Studios. Built with the App Router, Firebase Authentication, Prisma + Neon PostgreSQL, UploadThing media storage, and Gmail SMTP for transactional email.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Neon (serverless PostgreSQL) via Prisma ORM |
| Auth | Firebase Authentication + Admin SDK (session cookies) |
| Media | UploadThing (uploads) + YouTube / Google Drive embeds |
| Email — invites & resets | Nodemailer via Gmail SMTP |
| Email — forgot password | Firebase built-in email (customised template) |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |

---

## Prerequisites

- Node.js 18+
- A [Firebase project](https://console.firebase.google.com) with Authentication enabled (Email/Password + Google providers)
- A [Neon](https://neon.tech) PostgreSQL database (or any Postgres)
- An [UploadThing](https://uploadthing.com) account
- A Gmail account with **2-Step Verification** enabled (for App Passwords)

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd hawk-next
npm install
```

### 2. Create `.env.local`

Copy `.env.example` and fill in your values (see details below):

```bash
cp .env.example .env.local
```

### 3. Push the database schema

```bash
npm run db:push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Firebase Client keys

Found in Firebase Console → Project Settings → Your Apps → Web app config.
All `NEXT_PUBLIC_*` values are safe to expose to the browser.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### Firebase Admin SDK (server-only — keep secret)

1. Firebase Console → Project Settings → Service Accounts → **Generate new private key**
2. Download the JSON file and copy the three values below:

```env
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# Paste the private_key exactly from the JSON file (with literal \n characters), wrapped in double quotes:
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> **Vercel:** Paste the private key _without_ surrounding quotes in the Vercel dashboard. Vercel handles quoting automatically.

### Database

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Use the **pooled** connection string from your Neon project dashboard.

### UploadThing

1. Create an app at [uploadthing.com](https://uploadthing.com)
2. Copy the token from Dashboard → API Keys

```env
UPLOADTHING_TOKEN=
```

### Session secret

Used to sign the session cookie. Generate once with:

```bash
openssl rand -hex 64
```

```env
SESSION_SECRET=
```

### Gmail SMTP (admin invite & password-reset emails)

Nodemailer sends two types of emails:
- **Admin invite** — when a superadmin adds a new user ("Activate My Account")
- **Admin password reset** — when "Reset Password" is clicked on the Users page

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # 16-char Gmail App Password (see below)
SMTP_FROM="Hawk Creative Studios <you@gmail.com>"
```

**Getting a Gmail App Password:**
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   *(2-Step Verification must be enabled on the account)*
2. Select app: **Mail** → Device: **Other** → name it `hawk-next` → **Generate**
3. Copy the 16-character password (spaces don't matter — paste as-is)

### App URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000   # dev
# NEXT_PUBLIC_APP_URL=https://yourdomain.com  # production
```

---

## Firebase Console — Required Setup

### 1. Enable sign-in providers

Authentication → Sign-in methods → Enable:
- **Email/Password**
- **Google**

### 2. Authorised domains

Authentication → Settings → Authorised domains → add your production domain.
`localhost` is included by default for development.

### 3. Password reset email template

Authentication → Templates → **Password reset** → Edit:
- **Subject:** `Reset your password — Hawk Creative Studios`
- **Customize action URL** → set to your app's reset page:
  - Dev: `http://localhost:3000/reset-password`
  - Prod: `https://yourdomain.com/reset-password`
- Paste your branded HTML from `src/lib/mailer.ts` shell template (or use Firebase's default)

> The "Forgot password?" flow on the login page uses Firebase's own email system.
> The admin invite and "Reset Password" button use Nodemailer (Gmail SMTP) with a branded custom template.

### 4. Google OAuth (for production)

Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client:
- **Authorised JavaScript origins:** add `https://yourdomain.com`
- **Authorised redirect URIs:** add `https://yourdomain.com/__/auth/handler`

---

## Adding the First Superadmin

The **Users** section of the admin panel is only accessible to superadmins.
Run the helper script after making sure `.env.local` is in place:

```bash
node scripts/add-superadmin.mjs add you@example.com
```

To remove superadmin access:

```bash
node scripts/add-superadmin.mjs remove you@example.com
```

The user must already have a Firebase account (sign in once at `/login` first, or be added as admin first so Firebase creates the account).

---

## Admin Panel

| Section | Path | Access |
|---|---|---|
| Dashboard | `/admin` | Admin |
| Home Slides | `/admin/home` | Admin |
| About | `/admin/about` | Admin |
| Services | `/admin/services` | Admin |
| Portfolio | `/admin/portfolio` | Admin |
| Contact | `/admin/contact` | Admin |
| File Manager | `/admin/file-manager` | Admin |
| **Users** | `/admin/users` | **Superadmin only** |

Login: `/login` — Google or email/password

### Adding an admin user

1. Sign in as superadmin
2. Go to `/admin/users`
3. Enter the email and click **Add Admin**
4. The user receives a branded **"Activate My Account"** email (via Gmail SMTP) with a one-time password-setup link

### Password reset flows

| Trigger | Sender | Email style |
|---|---|---|
| Login page → "Forgot password?" | Firebase | Firebase template (customised in Console) |
| Admin panel → "Reset Password" button | Gmail SMTP (nodemailer) | Branded "Reset Your Password" email |

---

## Database Commands

```bash
# Push schema changes to the database
npm run db:push

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Re-generate Prisma client after schema changes
npm run db:generate
```

---

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "your message"
git push origin main
```

### 2. Import to Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your GitHub repo
2. Framework: **Next.js** (auto-detected via `vercel.json`)
3. Add all environment variables from `.env.local` under **Environment Variables**
   - Change `NEXT_PUBLIC_APP_URL` to your production domain
4. Click **Deploy**

### 3. Post-deploy checklist

- [ ] Add your Vercel domain to Firebase → Authorised Domains
- [ ] Add your domain to Google OAuth Client → Authorised JavaScript origins & redirect URIs
- [ ] Update Firebase password reset template → Action URL to production domain
- [ ] Confirm all env vars are set in Vercel dashboard

---

## Project Structure

```
src/
├── app/
│   ├── admin/              # Admin panel pages & layout
│   │   ├── layout.tsx      # Auth guard (requires admin claim)
│   │   ├── AdminNav.tsx    # Sidebar navigation
│   │   ├── home/           # Home slides editor
│   │   ├── about/          # About page editor
│   │   ├── services/       # Services editor
│   │   ├── portfolio/      # Portfolio editor
│   │   ├── contact/        # Contact editor
│   │   ├── users/          # User management (superadmin only)
│   │   └── file-manager/   # Media file manager
│   ├── api/
│   │   ├── auth/           # verify, session, forgot endpoints
│   │   ├── content/        # Content CRUD endpoints
│   │   ├── media/          # File manager & delete endpoints
│   │   └── users/          # Admin user management endpoints
│   ├── login/              # Login page (Google + email/password)
│   ├── not-found.tsx       # Custom 404 page
│   ├── error.tsx           # Custom 500 error page
│   └── reset-password/     # Password reset page (oobCode flow)
├── components/
│   ├── admin/              # Admin UI components
│   └── shared/             # Cursor, Header, Footer, NavOverlay, etc.
├── lib/
│   ├── auth.ts             # getSessionUser, requireAdmin, requireSuperAdmin
│   ├── firebase-admin.ts   # Firebase Admin SDK (lazy init)
│   ├── firebase-client.ts  # Firebase client SDK
│   ├── firebase-email.ts   # Firebase REST API — forgot-password emails
│   ├── mailer.ts           # Nodemailer (Gmail SMTP) — invite & reset emails
│   ├── prisma.ts           # Prisma client singleton
│   └── reset-link.ts       # Builds custom /reset-password URL from Firebase oobCode
├── types/
│   └── index.ts            # Shared TypeScript types
prisma/
└── schema.prisma           # Database schema
scripts/
└── add-superadmin.mjs      # CLI: add/remove superadmins
```

---

## Common Issues

### Google sign-in — "unauthorized-domain"
Add your domain to Firebase Console → Authentication → Settings → **Authorised Domains**.

### Google sign-in — "operation-not-allowed"
Enable the Google provider in Firebase Console → Authentication → **Sign-in methods**.

### Gmail SMTP — emails not sending
- Ensure **2-Step Verification** is enabled on `shaibal.tiller@gmail.com`
- Use a **Gmail App Password** (not your regular Gmail password)
- Generate one at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Check terminal / Vercel logs for `[invite email]` or `[reset email]` errors

### Password reset link goes to wrong page
- Firebase Console → Authentication → Templates → Password reset → Customize action URL
- Must match your current environment: `http://localhost:3000/reset-password` (dev) or `https://yourdomain.com/reset-password` (prod)

### `FIREBASE_ADMIN_PRIVATE_KEY` errors in production
On Vercel, paste the private key **without** surrounding quotes. The value should start with `-----BEGIN PRIVATE KEY-----` directly.

### Database connection issues
- Neon free tier databases pause after inactivity — the first request after a pause is slow but succeeds
- Use the **pooled** connection string (hostname contains `-pooler.neon.tech`)
