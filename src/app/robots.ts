import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/login',
          '/unauthorized',
          '/reset-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://hawk-beta.vercel.app/sitemap.xml',
  }
}
