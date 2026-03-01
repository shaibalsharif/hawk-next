/**
 * Add or remove a superadmin by email.
 *
 * Usage (run from project root):
 *   node scripts/add-superadmin.mjs add someone@example.com
 *   node scripts/add-superadmin.mjs remove someone@example.com
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load .env.local directly — handles multiline private key correctly
try {
  const envContent = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    val = val.replace(/\\n/g, '\n')
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* env file not found — assume vars already set */ }

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
