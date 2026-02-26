import type { Metadata } from 'next'
import './globals.css'
import ClientShell from '@/components/shared/ClientShell'
import Cursor from '@/components/shared/Cursor'

export const metadata: Metadata = {
  title: 'Hawk Creative Studios',
  description: 'We create visual stories — FPV cinematography, photography, and aerial perspectives.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Cursor lives at root so it is NEVER unmounted during navigation.
            It uses usePathname internally to hide itself on admin/login. */}
        <Cursor />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
