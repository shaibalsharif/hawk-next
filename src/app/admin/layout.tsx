import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import AdminNav from './AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()

  if (!user) redirect('/login')
  if (!user.admin) redirect('/unauthorized')

  return (
    <div className="native-cursor min-h-screen bg-dark-1 flex">
      <AdminNav userEmail={user.email ?? ''} superadmin={user.superadmin} />
      <main className="flex-1 ml-0 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 overflow-auto">
        {children}
      </main>
    </div>
  )
}
