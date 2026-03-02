'use client'
/**
 * useFileUpload — provider-agnostic upload hook.
 *
 * This is the ONLY place in components that knows about the upload provider.
 * To migrate to a different upload service (S3, Cloudflare R2, your own server,
 * etc.), change the implementation of this hook. All components that call
 * `useFileUpload` continue to work without modification.
 *
 * Contract:
 *   const { upload, uploading } = useFileUpload('image', onSuccess, onError)
 *   upload([file])  // triggers upload; calls onSuccess/onError when done
 */
import { useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing-react'
import type { MediaMeta } from '@/types'

export type UploadAccept = 'image' | 'video'

export function useFileUpload(
  accept: UploadAccept,
  onSuccess: (meta: MediaMeta) => void,
  onError: (message: string) => void,
): {
  upload: (files: File[]) => Promise<void>
  uploading: boolean
} {
  const [uploading, setUploading] = useState(false)

  const endpoint = accept === 'video' ? 'videoUploader' : 'imageUploader'

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res: { ufsUrl: string; key: string; name?: string; type?: string }[]) => {
      if (res?.[0]) {
        const f = res[0]
        const mimeType = f.type ?? (f.name?.toLowerCase().endsWith('.mp4') ? 'video/mp4' : undefined)
        onSuccess({
          type: 'uploadthing',
          url: f.ufsUrl,
          key: f.key,
          ...(mimeType ? { mimeType } : {}),
        })
      }
      setUploading(false)
    },
    onUploadError: (err: { message: string }) => {
      onError(err.message)
      setUploading(false)
    },
  })

  const upload = async (files: File[]) => {
    if (!files.length) return
    setUploading(true)
    await startUpload(files)
  }

  return { upload, uploading }
}
