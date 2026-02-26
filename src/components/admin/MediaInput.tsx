'use client'
import { useState } from 'react'
import type { MediaMeta } from '@/types'
import { getMediaUrl, extractYouTubeId } from '@/lib/media'
import { useUploadThing } from '@/lib/uploadthing-react'

type Tab = 'upload' | 'gdrive' | 'youtube' | 'url'

interface Props {
  value: MediaMeta | null
  onChange: (meta: MediaMeta | null) => void
  accept?: 'image' | 'video' | 'any'
  label?: string
  previewFit?: 'cover' | 'contain'
}

export default function MediaInput({ value, onChange, accept = 'image', label = 'Media', previewFit = 'cover' }: Props) {
  const [tab, setTab] = useState<Tab>('upload')
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const endpoint = (accept === 'video' ? 'videoUploader' : 'imageUploader') as 'imageUploader' | 'videoUploader'

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res: { ufsUrl: string; key: string }[]) => {
      if (res?.[0]) {
        onChange({ type: 'uploadthing', url: res[0].ufsUrl, key: res[0].key })
      }
      setUploading(false)
    },
    onUploadError: (err: { message: string }) => {
      setError(err.message)
      setUploading(false)
    },
  })

  const handleFile = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    setError('')
    await startUpload(Array.from(files))
  }

  const applyUrl = () => {
    if (!urlInput.trim()) return
    setError('')

    if (tab === 'gdrive') {
      onChange({ type: 'gdrive', url: urlInput.trim() })
    } else if (tab === 'youtube') {
      const id = extractYouTubeId(urlInput.trim())
      if (!id) { setError('Invalid YouTube URL'); return }
      onChange({ type: 'youtube', url: id })
    } else {
      onChange({ type: 'url', url: urlInput.trim() })
    }
    setUrlInput('')
  }

  const previewUrl = value ? getMediaUrl(value) : null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'gdrive', label: 'Google Drive' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'url', label: 'Direct URL' },
  ]

  return (
    <div className="space-y-3">
      <label className="block text-xs font-oswald tracking-widest uppercase text-white/60">{label}</label>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-dark-3 p-1 rounded">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); setError('') }}
            className={`flex-1 py-1.5 text-xs font-oswald tracking-wider uppercase rounded transition-colors ${
              tab === t.key ? 'bg-yellow-2 text-dark-1' : 'text-white/50 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded p-6 transition-colors cursor-pointer ${
            uploading ? 'border-yellow-2/50 bg-yellow-2/5' : 'border-white/20 hover:border-white/40'
          }`}>
            <input
              type="file"
              className="hidden"
              accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : '*/*'}
              onChange={(e) => handleFile(e.target.files)}
              disabled={uploading}
            />
            {uploading ? (
              <div className="flex items-center gap-2 text-yellow-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span className="text-xs font-oswald tracking-wider">Uploading…</span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-white/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-white/40 font-oswald tracking-wider">
                  {accept === 'video' ? 'Drop video (max 512 MB)' : 'Drop image (max 8 MB)'}
                </span>
              </>
            )}
          </label>
        </div>
      )}

      {/* URL-based tabs */}
      {tab !== 'upload' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyUrl()}
            placeholder={
              tab === 'gdrive' ? 'https://drive.google.com/file/d/…/view' :
              tab === 'youtube' ? 'https://youtube.com/watch?v=… or video ID' :
              'https://example.com/image.jpg'
            }
            className="flex-1 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
          />
          <button
            type="button"
            onClick={applyUrl}
            className="px-4 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Preview */}
      {value && (
        <div className="relative rounded overflow-hidden bg-dark-3">
          {value.type === 'youtube' ? (
            <iframe
              src={`https://www.youtube.com/embed/${value.url}?mute=1`}
              className="w-full aspect-video"
              allow="accelerometer; autoplay"
            />
          ) : (
            previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview"
                className={`w-full ${previewFit === 'contain' ? 'max-h-64 object-contain' : 'max-h-48 object-cover'}`}
              />
            )
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
            aria-label="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-2 text-xs text-white/40 font-oswald tracking-wider truncate">
            {value.type.toUpperCase()} — {value.url}
          </div>
        </div>
      )}
    </div>
  )
}
