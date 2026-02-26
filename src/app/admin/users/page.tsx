import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase-admin'
import { getSessionUser } from '@/lib/auth'
import UsersEditor from '@/components/admin/UsersEditor'
import type { AdminUser } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user = await getSessionUser()
  if (!user?.superadmin) redirect('/admin')

  let users: AdminUser[] = []
  try {
    const list = await adminAuth.listUsers(1000)
    users = list.users
      .filter((u) => u.customClaims?.admin === true)
      .map((u) => ({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        disabled: u.disabled,
      }))
  } catch {
    // Firebase admin not configured — show empty state
  }

  return <UsersEditor initialUsers={users} />
}
