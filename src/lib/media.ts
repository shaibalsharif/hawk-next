import type { MediaMeta } from '@/types'

export function getMediaUrl(meta: MediaMeta | null | undefined): string {
  if (!meta) return ''

  switch (meta.type) {
    case 'gdrive': {
      const match = meta.url.match(/\/d\/([^/]+)/)
      const id = match?.[1]
      return id ? `https://drive.google.com/uc?export=view&id=${id}` : meta.url
    }
    case 'youtube': {
      const id = extractYouTubeId(meta.url)
      if (!id) return meta.url
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&showinfo=0&rel=0&modestbranding=1`
    }
    case 'uploadthing':
    case 'url':
    default:
      return meta.url
  }
}

export function extractYouTubeId(input: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const p of patterns) {
    const m = input.match(p)
    if (m?.[1]) return m[1]
  }
  // If it looks like a bare ID (11 chars, alphanumeric+_-), return as-is
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  return null
}

/**
 * Returns true if the MediaMeta represents a video.
 * Uses the stored mimeType when available, falls back to URL extension
 * for direct URL entries where an extension may be present.
 */
export function isVideoMeta(meta: MediaMeta | null | undefined): boolean {
  if (!meta) return false
  if (meta.mimeType) return meta.mimeType.startsWith('video/')
  // Fallback: direct URL type where the URL may have an extension
  return /\.mp4(\?.*)?$/i.test(meta.url)
}

/** @deprecated Prefer isVideoMeta(meta) — UploadThing UFS URLs have no extension. */
export function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return /\.mp4(\?.*)?$/i.test(url)
}

export function gdriveUrlToEmbed(url: string): string {
  const match = url.match(/\/d\/([^/]+)/)
  const id = match?.[1]
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url
}
