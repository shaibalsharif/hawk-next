'use client'
import { useState } from 'react'
import MediaInput from '../MediaInput'
import FramePicker from './FramePicker'
import { isVideoMeta, isEmbedMedia, getThumbnailUrl, getMediaUrl } from '@/lib/media'
import { SIZE_PRESETS, POSITION_DOTS, type GalleryImageState } from './shared'
import type { PortfolioImage, MediaMeta } from '@/types'

interface Props {
  img: Partial<PortfolioImage>
  onDelete: () => void
  onStateChange?: (id: string, s: GalleryImageState) => void
  isHovered?: boolean
  onHoverChange?: (hovered: boolean) => void
}

export default function GalleryImageCard({ img, onDelete, onStateChange, isHovered, onHoverChange }: Props) {
  const [state, setState] = useState<GalleryImageState>({
    hidden: img.hidden ?? false,
    colSpan: img.colSpan ?? 1,
    rowSpan: img.rowSpan ?? 1,
    objectFit: img.objectFit ?? 'cover',
    objectPosition: img.objectPosition ?? 'center',
  })
  const [savedFlash, setSavedFlash] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localThumb, setLocalThumb] = useState<MediaMeta | null>(img.thumbMeta ?? null)
  const [showThumbInput, setShowThumbInput] = useState(false)
  const [showFramePicker, setShowFramePicker] = useState(false)

  const patch = async (next: Partial<GalleryImageState>) => {
    if (!img.id) return
    const updated = { ...state, ...next }
    setState(updated)
    onStateChange?.(img.id, updated)
    setSaving(true)
    await fetch(`/api/content/portfolio/${img.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', data: updated }),
    })
    setSaving(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1500)
  }

  const saveThumb = async (meta: MediaMeta | null) => {
    if (!img.id) return
    setLocalThumb(meta)
    setShowThumbInput(false)
    await fetch(`/api/content/portfolio/${img.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', data: { thumbMeta: meta } }),
    })
  }

  const meta = img.imageMeta as MediaMeta | undefined
  const isEmbed = meta ? isEmbedMedia(meta) : false
  const isDirectVideo = meta ? (!isEmbed && isVideoMeta(meta)) : false
  const autoThumbSrc = meta ? (isEmbed ? getThumbnailUrl(meta) : getMediaUrl(meta)) : ''
  const isVideoItem = isDirectVideo || isEmbed
  const displayThumbSrc = localThumb ? getMediaUrl(localThumb) : autoThumbSrc

  return (
    <div
      className={`bg-dark-3 rounded-lg overflow-hidden border transition-colors duration-200 ${isHovered ? 'border-yellow-2/60' : 'border-white/5'}`}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-2 group">
        {meta && (
          isDirectVideo && !localThumb ? (
            <video src={displayThumbSrc} muted playsInline preload="metadata"
              className="w-full h-full"
              style={{ objectFit: state.objectFit as 'cover' | 'contain', objectPosition: state.objectPosition }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayThumbSrc} alt=""
              className="w-full h-full"
              style={{ objectFit: state.objectFit as 'cover' | 'contain', objectPosition: state.objectPosition }}
            />
          )
        )}

        {/* Hover highlight from preview tile */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-200 bg-yellow-2/10 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

        {/* Badges */}
        <div className="absolute top-1.5 left-1.5 flex gap-1">
          {state.hidden && (
            <span className="text-[9px] font-oswald tracking-wider uppercase bg-black/80 text-white/40 px-1.5 py-0.5 rounded">Hidden</span>
          )}
          {savedFlash && (
            <span className="text-[9px] font-oswald tracking-wider uppercase bg-green-600/90 text-white px-1.5 py-0.5 rounded">Saved ✓</span>
          )}
          {saving && (
            <span className="text-[9px] font-oswald tracking-wider uppercase bg-dark-1/80 text-white/50 px-1.5 py-0.5 rounded">Saving…</span>
          )}
        </div>

        <button
          onClick={onDelete}
          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="p-2.5 space-y-2.5">
        {/* Row 1: Hidden toggle + Fit toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => patch({ hidden: !state.hidden })}
            title={state.hidden ? 'Hidden — click to show' : 'Visible — click to hide'}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-oswald tracking-wider uppercase border transition-colors flex-1 justify-center ${
              state.hidden
                ? 'border-white/10 text-white/30 bg-transparent'
                : 'border-yellow-2/50 text-yellow-2 bg-yellow-2/5'
            }`}
          >
            {state.hidden ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {state.hidden ? 'Hidden' : 'Visible'}
          </button>

          <div className="flex rounded overflow-hidden border border-white/10 flex-1">
            {(['cover', 'contain'] as const).map((fit) => (
              <button
                key={fit}
                onClick={() => patch({ objectFit: fit })}
                className={`flex-1 py-1 text-[10px] font-oswald tracking-wider uppercase transition-colors ${
                  state.objectFit === fit ? 'bg-yellow-2 text-dark-1' : 'text-white/40 hover:text-white'
                }`}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Size picker — 3×3 grid */}
        <div className="grid grid-cols-3 gap-0.5">
          {SIZE_PRESETS.map((preset) => {
            const active = state.colSpan === preset.colSpan && state.rowSpan === preset.rowSpan
            return (
              <button
                key={`${preset.colSpan}x${preset.rowSpan}`}
                onClick={() => patch({ colSpan: preset.colSpan, rowSpan: preset.rowSpan })}
                className={`py-1 rounded text-[9px] font-oswald tracking-wider uppercase border transition-colors ${
                  active ? 'bg-yellow-2 text-dark-1 border-yellow-2' : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                }`}
              >
                {preset.colSpan}×{preset.rowSpan}
              </button>
            )
          })}
        </div>

        {/* Row 3: Object position 3×3 dot grid */}
        <div className="grid grid-cols-3 gap-0.5 w-[60px]">
          {POSITION_DOTS.map((pos) => (
            <button
              key={pos}
              onClick={() => patch({ objectPosition: pos })}
              title={pos}
              className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors ${
                state.objectPosition === pos ? 'bg-yellow-2' : 'bg-white/10 hover:bg-white/25'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${state.objectPosition === pos ? 'bg-dark-1' : 'bg-white/50'}`} />
            </button>
          ))}
        </div>

        {/* Row 4: Custom thumbnail (video items only) */}
        {isVideoItem && (
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-oswald tracking-widest uppercase text-white/30">Thumbnail</p>
              {localThumb && (
                <button
                  type="button"
                  onClick={() => saveThumb(null)}
                  className="text-[9px] font-oswald tracking-wider uppercase text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {localThumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getMediaUrl(localThumb)} alt="Thumbnail" className="w-full aspect-video object-cover rounded" />
            ) : showThumbInput ? (
              <MediaInput value={null} onChange={saveThumb} label="" accept="image" />
            ) : (
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowThumbInput(true)}
                  className="flex-1 py-1.5 border border-dashed border-white/15 rounded text-[10px] font-oswald tracking-wider uppercase text-white/25 hover:border-yellow-2/40 hover:text-yellow-2/60 transition-colors"
                >
                  + Upload Image
                </button>
                {isDirectVideo && (
                  <button
                    type="button"
                    onClick={() => setShowFramePicker(true)}
                    className="flex-1 py-1.5 border border-dashed border-white/15 rounded text-[10px] font-oswald tracking-wider uppercase text-white/25 hover:border-yellow-2/40 hover:text-yellow-2/60 transition-colors"
                  >
                    + Pick Frame
                  </button>
                )}
              </div>
            )}

            {showFramePicker && isDirectVideo && meta && (
              <FramePicker
                videoSrc={getMediaUrl(meta)}
                onCapture={(captured) => { setShowFramePicker(false); saveThumb(captured) }}
                onClose={() => setShowFramePicker(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
