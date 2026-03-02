import type { Metadata } from 'next'
import './globals.css'
import ClientShell from '@/components/shared/ClientShell'
import Cursor from '@/components/shared/Cursor'

const BASE_URL = 'https://hawk-beta.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Hawk Creative Studios',
    template: '%s | Hawk Creative Studios',
  },
  description: 'We create visual stories — FPV cinematography, photography, and aerial perspectives that capture the world from every angle.',
  keywords: [
    'FPV cinematography', 'aerial photography', 'drone videography',
    'creative studio', 'visual storytelling', 'Hawk Creative Studios',
  ],
  authors: [{ name: 'Hawk Creative Studios', url: BASE_URL }],
  creator: 'Hawk Creative Studios',
  publisher: 'Hawk Creative Studios',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Hawk Creative Studios',
    title: 'Hawk Creative Studios',
    description: 'We create visual stories — FPV cinematography, photography, and aerial perspectives.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Hawk Creative Studios' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hawk Creative Studios',
    description: 'We create visual stories — FPV cinematography, photography, and aerial perspectives.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo192.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hawk Creative Studios',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description: 'We create visual stories — FPV cinematography, photography, and aerial perspectives that capture the world from every angle.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {/* Cursor lives at root so it is NEVER unmounted during navigation.
            It uses usePathname internally to hide itself on admin/login. */}
        <Cursor />
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
