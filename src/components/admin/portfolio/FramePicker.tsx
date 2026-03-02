'use client'
import { useState, useRef } from 'react'
import { useFileUpload } from '@/hooks/useFileUpload'
import type { MediaMeta } from '@/types'

interface Props {
  videoSrc: string
  onCapture: (meta: MediaMeta) => void
  onClose: () => void
}

/**
 * Modal that lets the admin scrub a video and capture a specific frame as a
 * thumbnail image. The captured frame is uploaded and returned as a MediaMeta.
 */
export default function FramePicker({ videoSrc, onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [error, setError] = useState('')

  const { upload, uploading } = useFileUpload(
    'image',
    (meta) => { onCapture(meta) },
    (msg) => { setError(msg) },
  )

  const capture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    try {
      ctx.drawImage(video, 0, 0)
      setCaptured(canvas.toDataURL('image/jpeg', 0.9))
      setError('')
    } catch {
      setError('Cannot capture — pause the video first, or use "Upload Image" instead.')
    }
  }

  const useFrame = () => {
    const canvas = canvasRef.current
    if (!canvas || !captured) return
    canvas.toBlob(async (blob) => {
      if (!blob) { setError('Failed to create image'); return }
      await upload([new File([blob], 'frame-thumb.jpg', { type: 'image/jpeg' })])
    }, 'image/jpeg', 0.9)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-dark-2 rounded-lg overflow-hidden w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-oswald tracking-wider uppercase text-yellow-2">Pick Frame</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-[10px] font-oswald tracking-widest uppercase text-white/30">
            Scrub to the desired frame, pause, then click Capture
          </p>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3 items-start">
            {/* Video player */}
            <div className="flex-1 min-w-0 space-y-2">
              <video
                ref={videoRef}
                src={videoSrc}
                crossOrigin="anonymous"
                controls
                playsInline
                className="w-full aspect-video rounded bg-black"
              />
              <button
                type="button"
                onClick={capture}
                className="w-full py-2 bg-dark-3 border border-white/20 rounded text-xs font-oswald tracking-wider uppercase text-white/70 hover:border-yellow-2/50 hover:text-yellow-2 transition-colors"
              >
                {captured ? 'Recapture' : 'Capture Frame'}
              </button>
            </div>

            {/* Preview + use button */}
            <div className="w-64 flex-shrink-0 space-y-2">
              <p className="text-[10px] font-oswald tracking-widest uppercase text-white/30">
                {captured ? 'Captured frame' : 'No frame captured yet'}
              </p>
              <div className="aspect-video bg-dark-3 rounded border border-white/10 flex items-center justify-center overflow-hidden">
                {captured ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={captured} alt="Captured frame" className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-8 h-8 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={useFrame}
                disabled={!captured || uploading}
                className="w-full py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading…' : 'Use This Frame'}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      </div>
    </div>
  )
}
