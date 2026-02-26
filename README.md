# Hawk Creative Studios — Next.js Admin & Website

A full-stack Next.js 15 website and content management system for Hawk Creative Studios. Built with the App Router, Firebase Auth, Prisma + Neon PostgreSQL, UploadThing media storage, and Resend for transactional email.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Neon (serverless PostgreSQL) via Prisma ORM |
| Auth | Firebase Authentication + Admin SDK (session cookies) |
| Media | UploadThing (uploads) + Google Drive / YouTube / direct URL refs |
| Email | Resend |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |

---

## Prerequisites

- Node.js 18+
- A [Firebase project](https://console.firebase.google.com) with Authentication enabled
- A [Neon](https://neon.tech) PostgreSQL database (or any Postgres)
- An [UploadThing](https://uploadthing.com) account
- A [Resend](https://resend.com) account with a verified sending domain

---

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd hawk-next
npm install
```

### 2. Create `.env.local`

Copy the template below and fill in your values:

```env
# ── Firebase Client (public) ──────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ── Firebase Admin SDK (server-only) ─────────────────────────
FIREBASE_ADMIN_PROJECT_ID=your-project
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# Paste the private key exactly as it appears in the JSON file (with literal \n line breaks)
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# ── Database ──────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# ── UploadThing ───────────────────────────────────────────────
UPLOADTHING_TOKEN=

# ── Resend (email) ────────────────────────────────────────────
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ── App URL (used for password-reset links) ───────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
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

## Environment Variables — Details

### Firebase Client keys

Found in Firebase Console → Project Settings → Your Apps → Web app config.

All `NEXT_PUBLIC_*` values are safe to expose to the browser.

### Firebase Admin SDK

1. Firebase Console → Project Settings → Service Accounts → **Generate new private key**
2. Download the JSON file
3. Copy `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
4. Copy `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
5. Copy `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY` (keep the `\n` line breaks; wrap in double quotes)

### Firebase Auth — required console steps

1. **Enable providers**: Firebase Console → Authentication → Sign-in methods → Enable **Email/Password** and **Google**
2. **Authorized domains**: Authentication → Settings → Authorized domains → add your production domain (e.g. `yourdomain.com`). `localhost` is added by default.
3. **Google OAuth**: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client → add your domain to **Authorized JavaScript origins** and **Authorized redirect URIs** (`https://yourdomain.com/__/auth/handler`)

### UploadThing

1. Create an app at [uploadthing.com](https://uploadthing.com)
2. Copy the token from Dashboard → API Keys → `UPLOADTHING_TOKEN`

### Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your sending domain under Domains
3. Create an API key → `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to an address on your verified domain

### Database

Use the connection string from your Neon project dashboard (or any Postgres provider).
Neon pooled connection strings end with `?sslmode=require`.

---

## Adding the First Superadmin

The **Users** section of the admin panel is only visible to superadmins.
A superadmin is a user whose Firebase UID is stored in the `SuperAdmin` table.

Run the helper script from the project root (requires your `.env.local` vars to be in scope):

```bash
# Load env and run script
export $(grep -v '^#' .env.local | grep -E '^[A-Z_]+=.*' | xargs) && \
  node scripts/add-superadmin.mjs add you@example.com
```

To remove superadmin access:

```bash
export $(grep -v '^#' .env.local | grep -E '^[A-Z_]+=.*' | xargs) && \
  node scripts/add-superadmin.mjs remove you@example.com
```

The user must already have a Firebase account (sign in first, or use the admin panel to add them as an admin first).

---

## Database Commands

```bash
# Push schema changes to the database (dev / initial setup)
npm run db:push

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Re-generate Prisma client after schema changes
npm run db:generate
```

---

## Admin Panel

URL: `/admin`
Login: `/login`

The admin panel is protected by Firebase session cookies. A user must have the `admin: true` Firebase custom claim to access it.

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

### Adding an admin user

1. Sign in as superadmin
2. Go to `/admin/users`
3. Enter the email address and click **Add Admin**
4. The user receives a branded email with a password-setup link

### Password reset flow

- From the login page → "Forgot password?" → enter email → custom branded email sent via Resend
- From the Users panel → "Reset Password" button next to any admin → generates a one-time link

---

## Deployment (Vercel — recommended)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

### 2. Import to Vercel

1. [vercel.com/new](https://vercel.com/new) → Import your repo
2. Framework: **Next.js** (auto-detected)
3. Add all environment variables from `.env.local` under **Environment Variables**
   - Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://yourdomain.com`)
4. Click **Deploy**

### 3. Post-deploy steps

- Add your Vercel domain to Firebase → Authorized Domains
- Add your domain to the Google OAuth consent screen redirect URIs
- Ensure `DATABASE_URL` points to your production database (Neon handles this with the same URL)

### Build command (default)
```bash
next build
```

### Environment variables on Vercel

Multi-line values like `FIREBASE_ADMIN_PRIVATE_KEY` must be entered **without** surrounding quotes in the Vercel dashboard. Vercel handles quoting automatically.

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
│   │   ├── services/       # Services page editor
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
│   └── reset-password/     # Password reset page
├── components/
│   └── admin/              # All admin UI components
├── lib/
│   ├── auth.ts             # Session helpers, requireAdmin, requireSuperAdmin
│   ├── email.ts            # Resend email templates
│   ├── firebase-admin.ts   # Firebase Admin SDK (lazy init)
│   ├── firebase-client.ts  # Firebase client SDK
│   ├── prisma.ts           # Prisma client singleton
│   └── reset-link.ts       # Custom password reset URL builder
├── types/
│   └── index.ts            # Shared TypeScript types
prisma/
└── schema.prisma           # Database schema
scripts/
└── add-superadmin.mjs      # CLI to add/remove superadmins
```

---

## Common Issues

### Google sign-in shows "unauthorized-domain" error
Add your domain (and `localhost`) to Firebase Console → Authentication → Settings → **Authorized Domains**.

### Google sign-in shows "operation-not-allowed" error
Enable the Google provider in Firebase Console → Authentication → **Sign-in methods**.

### Emails not sending
- Check `RESEND_API_KEY` is valid
- Ensure `RESEND_FROM_EMAIL` is on a **verified domain** in Resend (not just `gmail.com`)
- In development, Resend only sends to the email address you used to sign up unless you verify a domain

### `FIREBASE_ADMIN_PRIVATE_KEY` errors in production
On Vercel, paste the private key **without** surrounding quotes. The key should start with `-----BEGIN PRIVATE KEY-----` directly.

### Database connection issues
- Neon free tier databases pause after inactivity — the first request after a pause is slow but succeeds
- Use the **pooled** connection string for Next.js (ends with `-pooler.neon.tech`)
