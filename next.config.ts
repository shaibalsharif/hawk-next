import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.ufs.sh' },       // UploadThing
      { protocol: 'https', hostname: 'utfs.io' },        // UploadThing legacy
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
  // Allow YouTube iframes
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https:",
              "frame-src https://www.youtube.com https://drive.google.com",
              "connect-src 'self' https: wss:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
