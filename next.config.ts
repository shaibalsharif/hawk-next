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
        // Firebase signInWithPopup needs same-origin-allow-popups so Chrome
        // doesn't block window.closed / postMessage from the Google auth popup
        source: '/login',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // apis.google.com  — Google Sign-In popup script
              // www.gstatic.com  — Firebase JS SDK chunks
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https:",
              // accounts.google.com  — OAuth consent popup
              // *.firebaseapp.com    — Firebase auth iframe (uses project-id.firebaseapp.com)
              "frame-src https://www.youtube.com https://drive.google.com https://accounts.google.com https://*.firebaseapp.com",
              "connect-src 'self' https: wss:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
