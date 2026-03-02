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
│   │   ├── media/          # File manager, delete, cleanup endpoints
│   │   └── users/          # Admin user management endpoints
│   ├── login/              # Login page (Google + email/password)
│   ├── not-found.tsx       # Custom 404 page
│   ├── error.tsx           # Custom 500 error page
│   └── reset-password/     # Password reset page (oobCode flow)
├── components/
│   ├── admin/
│   │   ├── portfolio/      # Portfolio sub-components (modular)
│   │   │   ├── shared.ts               # Shared constants & types
│   │   │   ├── CategoryModal.tsx       # Category create/edit modal
│   │   │   ├── ItemModal.tsx           # Item create/edit modal (details + gallery tabs)
│   │   │   ├── GalleryImageCard.tsx    # Per-image card: size, fit, position, hidden controls
│   │   │   ├── FramePicker.tsx         # Video frame capture → custom thumbnail
│   │   │   ├── SortableCategoryCard.tsx
│   │   │   ├── SortablePortfolioItemCard.tsx
│   │   │   └── SortablePreviewTile.tsx # Draggable tile in layout preview grid
│   │   ├── PortfolioEditor.tsx # Main orchestrator (~280 lines)
│   │   ├── MediaInput.tsx      # Unified media picker (upload / URL / YouTube / GDrive)
│   │   ├── FileManagerClient.tsx
│   │   └── ConfirmModal.tsx
│   └── portfolio/          # Public-facing portfolio components
├── hooks/
│   └── useFileUpload.ts    # Provider-agnostic upload hook (wraps storage client)
├── lib/
│   ├── storage/            # Storage provider abstraction layer
│   │   ├── types.ts                    # StorageProvider interface
│   │   ├── providers/
│   │   │   └── uploadthing.ts          # UploadThing implementation (only file using UTApi)
│   │   └── index.ts                    # Re-exports active provider as `storage`
│   ├── auth.ts             # getSessionUser, requireAdmin, requireSuperAdmin
│   ├── firebase-admin.ts   # Firebase Admin SDK (lazy init)
│   ├── firebase-client.ts  # Firebase client SDK
│   ├── firebase-email.ts   # Firebase REST API — forgot-password emails
│   ├── mailer.ts           # Nodemailer (Gmail SMTP) — invite & reset emails
│   ├── media.ts            # MediaMeta helpers: isVideoMeta, getThumbnailUrl, etc.
│   ├── prisma.ts           # Prisma client singleton
│   └── reset-link.ts       # Builds custom /reset-password URL from Firebase oobCode
├── types/
│   └── index.ts            # Shared TypeScript types (MediaMeta, PortfolioImage, etc.)
prisma/
└── schema.prisma           # Database schema
scripts/
└── add-superadmin.mjs      # CLI: add/remove superadmins
```

---

## Media Storage Architecture

All file storage is handled through a provider abstraction layer so the rest of the codebase is decoupled from any specific service.

### How it works

**Server-side** — `src/lib/storage/index.ts` exports a single `storage` object that every API route uses for listing, fetching URLs, and deleting files. The only file that imports from `uploadthing/server` is `src/lib/storage/providers/uploadthing.ts`.

**Client-side** — `src/hooks/useFileUpload.ts` is the only file that calls `useUploadThing`. All components call `useFileUpload()` instead, with no direct dependency on UploadThing's client SDK.

### MediaMeta type

Every media field in the database is stored as a JSON object:

```ts
type MediaMeta =
  | { type: 'uploadthing'; url: string; key: string; mimeType?: string }
  | { type: 'youtube';     url: string }   // YouTube video ID
  | { type: 'gdrive';      url: string }   // Google Drive file ID
  | { type: 'url';         url: string }   // Plain external URL
```

### Video thumbnails (thumbMeta)

Gallery images that are videos can have a separate custom thumbnail captured via the frame picker. This is stored in `PortfolioImage.thumbMeta` (same `MediaMeta` shape). The file manager recognises both `imageMeta` and `thumbMeta` when determining whether a file is in use.

---

## Migrating to a Different Storage Provider

When you want to move away from UploadThing (e.g. to S3, Cloudflare R2, or your own server), the changes are intentionally concentrated in as few files as possible.

### Step 1 — Server-side provider

Create `src/lib/storage/providers/my-provider.ts` implementing the `StorageProvider` interface:

```ts
import type { StorageProvider } from '../types'

export const myProvider: StorageProvider = {
  async listFiles() { /* ... */ },
  async getFileUrls(keys) { /* ... */ },
  async deleteFiles(keys) { /* ... */ },
}
```

Then change **one line** in `src/lib/storage/index.ts`:

```ts
// Before:
export { uploadthingProvider as storage } from './providers/uploadthing'
// After:
export { myProvider as storage } from './providers/my-provider'
```

### Step 2 — Client-side upload hook

Update `src/hooks/useFileUpload.ts` to call your new upload endpoint or SDK. No component changes are needed — all components call `useFileUpload()`.

### Step 3 — Upload route handler

UploadThing uses a dedicated route at `src/app/api/uploadthing/`. Replace this with whatever your new provider requires (a signed URL endpoint, a direct-upload handler, etc.).

### Step 4 — Database migration

Existing DB records have `"type": "uploadthing"` in their JSON columns. Run a one-time script to rewrite URLs and update the `type` field:

```ts
// Pseudocode — adapt to your new provider
const images = await prisma.portfolioImage.findMany()
for (const img of images) {
  const meta = img.imageMeta as MediaMeta
  if (meta.type === 'uploadthing') {
    const newUrl = await reuploadToNewProvider(meta.url)
    await prisma.portfolioImage.update({
      where: { id: img.id },
      data: { imageMeta: { type: 'my-provider', url: newUrl, key: '...' } },
    })
  }
}
```

Apply the same script to all other `Json` columns that store `MediaMeta`: `PortfolioItem.coverMeta`, `PortfolioCategory.imageMeta`, `PortfolioImage.thumbMeta`, `TeamMember.imageMeta`, etc.

### Summary of files to change

| File | What to do |
|---|---|
| `src/lib/storage/providers/uploadthing.ts` | Keep for reference or delete after migration |
| `src/lib/storage/providers/my-provider.ts` | Create — implement `StorageProvider` |
| `src/lib/storage/index.ts` | Change one re-export line |
| `src/hooks/useFileUpload.ts` | Update to use new client SDK / endpoint |
| `src/app/api/uploadthing/` | Replace with new provider's route handler |
| `src/types/index.ts` | Add new type to `MediaMeta` union |
| Database | One-time migration script for all `Json` media columns |

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
