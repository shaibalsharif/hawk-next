/**
 * Add or remove a superadmin by email.
 *
 * Usage:
 *   node scripts/add-superadmin.mjs add someone@example.com
 *   node scripts/add-superadmin.mjs remove someone@example.com
 *
 * Requires DATABASE_URL and Firebase Admin env vars to be set.
 * Run from the project root:
 *   export $(cat .env.local | grep -v '^#' | xargs) && node scripts/add-superadmin.mjs add you@example.com
 */

import { PrismaClient } from '@prisma/client'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const prisma = new PrismaClient()

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })

const adminAuth = getAuth(app)

async function main() {
  const [, , action, email] = process.argv

  if (!action || !email || !['add', 'remove'].includes(action)) {
    console.error('Usage: node scripts/add-superadmin.mjs <add|remove> <email>')
    process.exit(1)
  }

  // Look up Firebase user
  let uid
  try {
    const user = await adminAuth.getUserByEmail(email)
    uid = user.uid
    console.log(`Found Firebase user: ${user.email} (uid: ${uid})`)
  } catch {
    console.error(`No Firebase user found with email: ${email}`)
    process.exit(1)
  }

  if (action === 'add') {
    await prisma.superAdmin.upsert({
      where: { uid },
      create: { uid, email },
      update: { email },
    })
    console.log(`✓ ${email} is now a superadmin.`)
  } else {
    await prisma.superAdmin.deleteMany({ where: { uid } })
    console.log(`✓ Removed superadmin access from ${email}.`)
  }

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
