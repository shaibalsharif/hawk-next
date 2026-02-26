'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideGlobal = pathname === '/login' || pathname === '/reset-password' || pathname.startsWith('/admin')

  return (
    <>
      {!hideGlobal && <Header />}
      <main>{children}</main>
    </>
  )
}
