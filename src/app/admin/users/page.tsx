import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import UsersEditor from '@/components/admin/UsersEditor'
import type { AdminUser } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user = await getSessionUser()
  if (!user?.superadmin) redirect('/admin')

  let users: AdminUser[] = []

  try {
    // 1. Fetch Firebase admin users
    const list = await adminAuth.listUsers(1000)
    const firebaseAdmins = list.users.filter((u) => u.customClaims?.admin === true)

    // 2. Join with DB activity meta — failure here must NOT hide Firebase users
    let metaByUid: Record<string, { lastIp: string | null; lastLocation: string | null; lastDevice: string | null; lastSeenAt: Date | null }> = {}
    try {
      const uids = firebaseAdmins.map((u) => u.uid)
      const metas = await prisma.adminLoginMeta.findMany({ where: { uid: { in: uids } } })
      metaByUid = Object.fromEntries(metas.map((m) => [m.uid, m]))
    } catch {
      // DB meta unavailable — show users without activity data
    }

    users = firebaseAdmins.map((u) => {
      const meta = metaByUid[u.uid]
      return {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        disabled: u.disabled,
        emailVerified: u.emailVerified,
        creationTime: u.metadata.creationTime,
        lastSignInTime: u.metadata.lastSignInTime,
        providers: u.providerData.map((p) => p.providerId),
        lastIp: meta?.lastIp ?? null,
        lastLocation: meta?.lastLocation ?? null,
        lastDevice: meta?.lastDevice ?? null,
        lastSeenAt: meta?.lastSeenAt?.toISOString() ?? null,
      }
    })
  } catch {
    // Firebase Admin not configured
  }

  return <UsersEditor initialUsers={users} />
}
