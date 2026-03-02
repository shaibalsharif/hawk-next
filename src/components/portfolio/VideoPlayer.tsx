'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

// ── Icons ────────────────────────────────────────────────────────────────────

function IconPlay() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
function IconPause() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}
function IconVolumeMuted() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IconVolumeLow() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
    </svg>
  )
}
function IconVolumeHigh() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IconPiP() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.25" y="4.5" width="19.5" height="15" rx="1.25" />
      <rect x="12" y="12.75" width="8.25" height="5.25" rx="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconEnterFullscreen() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25-11.25h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
  )
}
function IconExitFullscreen() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
    </svg>
  )
}

// ── Tooltip button ────────────────────────────────────────────────────────────

function CtrlBtn({
  label,
  shortcut,
  onClick,
  children,
}: {
  label: string
  shortcut?: string
  onClick?: (e: React.MouseEvent) => void
  children: React.ReactNode
}) {
  const [show, setShow] = useState(false)
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={onClick}
        className="p-1.5 text-white/70 hover:text-white transition-colors"
      >
        {children}
      </button>
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 rounded px-2.5 py-1.5 whitespace-nowrap pointer-events-none z-50 flex items-center gap-2">
          <span className="text-[10px] font-oswald tracking-wider uppercase text-white">{label}</span>
          {shortcut && (
            <span className="text-[10px] font-mono text-yellow-2 border border-yellow-2/30 rounded px-1 py-0.5 leading-none">
              {shortcut}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── VideoPlayer ───────────────────────────────────────────────────────────────

interface Props {
  src: string
  autoPlay?: boolean
  className?: string
}

export default function VideoPlayer({ src, autoPlay = true, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const seekBarRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPct, setBufferedPct] = useState(0)
  const [topLoadPct, setTopLoadPct] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [flash, setFlash] = useState<{ text: string; key: number } | null>(null)
  const [mac] = useState(isMac)

  // ── Client-only init ────────────────────────────────────────────────────────

  useEffect(() => {
    setPipSupported(
      'pictureInPictureEnabled' in document &&
      !!(document as Document & { pictureInPictureEnabled: boolean }).pictureInPictureEnabled
    )
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // ── Flash feedback ──────────────────────────────────────────────────────────

  const showFlash = useCallback((text: string) => {
    setFlash({ text, key: Date.now() })
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlash(null), 700)
  }, [])

  // ── Controls auto-hide ───────────────────────────────────────────────────────

  const resetHide = useCallback((paused?: boolean) => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    if (!paused) {
      hideTimer.current = setTimeout(() => {
        setShowControls(false)
        setShowSpeedMenu(false)
      }, 3000)
    }
  }, [])

  // ── Buffer ──────────────────────────────────────────────────────────────────

  const updateBuffer = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.duration || !isFinite(v.duration)) return
    let end = 0
    for (let i = 0; i < v.buffered.length; i++) {
      if (v.buffered.start(i) <= v.currentTime + 0.1) {
        end = Math.max(end, v.buffered.end(i))
      }
    }
    const pct = (end / v.duration) * 100
    setBufferedPct(pct)
    setTopLoadPct(pct)
  }, [])

  // ── Video events ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => { setPlaying(true); resetHide(false) }
    const onPause = () => { setPlaying(false); setShowControls(true); clearTimeout(hideTimer.current) }
    const onTime = () => { setCurrentTime(v.currentTime); updateBuffer() }
    const onDuration = () => setDuration(v.duration)
    const onProgress = () => updateBuffer()
    const onVolume = () => { setMuted(v.muted); setVolume(v.volume) }
    const onRate = () => setSpeed(v.playbackRate)

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('durationchange', onDuration)
    v.addEventListener('progress', onProgress)
    v.addEventListener('volumechange', onVolume)
    v.addEventListener('ratechange', onRate)

    if (autoPlay) v.play().catch(() => {})

    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('durationchange', onDuration)
      v.removeEventListener('progress', onProgress)
      v.removeEventListener('volumechange', onVolume)
      v.removeEventListener('ratechange', onRate)
    }
  }, [autoPlay, resetHide, updateBuffer])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  // Scoped to this component (mounted = lightbox open). Avoids conflicts with
  // lightbox arrow-key navigation by not binding ←/→.

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current
      if (!v) return
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.key) {
        case ' ':
        case 'k':
        case 'K':
          e.preventDefault()
          if (v.paused) { v.play().catch(() => {}); showFlash('▶') }
          else { v.pause(); showFlash('⏸') }
          break
        case 'm':
        case 'M':
          v.muted = !v.muted
          showFlash(v.muted ? '🔇  Muted' : '🔊  Unmuted')
          break
        case 'f':
        case 'F': {
          e.preventDefault()
          const c = containerRef.current
          if (!c) break
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
          else c.requestFullscreen().catch(() => {})
          break
        }
        case 'p':
        case 'P':
          if (!pipSupported) break
          e.preventDefault()
          if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {})
          else v.requestPictureInPicture().catch(() => {})
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showFlash, pipSupported])

  // ── Close speed menu on outside click ─────────────────────────────────────

  useEffect(() => {
    if (!showSpeedMenu) return
    const handler = () => setShowSpeedMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showSpeedMenu])

  // ── Seek ──────────────────────────────────────────────────────────────────────

  const seekTo = useCallback((clientX: number) => {
    const v = videoRef.current
    const bar = seekBarRef.current
    if (!v || !bar || !isFinite(v.duration)) return
    const rect = bar.getBoundingClientRect()
    v.currentTime = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * v.duration
  }, [])

  const handleSeekDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    seekTo(e.clientX)
    const onMove = (ev: MouseEvent) => seekTo(ev.clientX)
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [seekTo])

  // ── Volume ────────────────────────────────────────────────────────────────────

  const handleVolume = useCallback((val: number) => {
    const v = videoRef.current
    if (!v) return
    v.volume = val
    v.muted = val === 0
  }, [])

  // ── Derived ───────────────────────────────────────────────────────────────────

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const volDisplay = muted ? 0 : volume

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`relative bg-black select-none group ${className ?? ''}`}
      style={{ cursor: showControls ? 'default' : 'none' }}
      onMouseMove={() => resetHide(videoRef.current?.paused)}
      onMouseLeave={() => {
        if (!videoRef.current?.paused) {
          clearTimeout(hideTimer.current)
          hideTimer.current = setTimeout(() => setShowControls(false), 600)
        }
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Top buffer bar (always visible) ───────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-20 pointer-events-none">
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute inset-y-0 left-0 bg-white/40 transition-[width] duration-500 ease-out"
          style={{ width: `${topLoadPct}%` }}
        />
      </div>

      {/* ── Video element ─────────────────────────────────────────────── */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="auto"
        className="block max-w-full max-h-[85vh]"
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          const v = videoRef.current
          if (!v) return
          if (v.paused) { v.play().catch(() => {}); showFlash('▶') }
          else { v.pause(); showFlash('⏸') }
        }}
      />

      {/* ── Center flash feedback ─────────────────────────────────────── */}
      <AnimatePresence>
        {flash && (
          <motion.div
            key={flash.key}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.15 }}
          >
            <div className="bg-black/75 backdrop-blur-sm rounded-xl px-5 py-2.5 text-white text-sm font-oswald tracking-widest uppercase">
              {flash.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Controls overlay ─────────────────────────────────────────── */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent rounded-b pointer-events-none" />

        <div className="relative px-3 pb-3 pt-10">
          {/* ── Seek bar ──────────────────────────────────────────────── */}
          <div
            ref={seekBarRef}
            className="relative mb-3 cursor-pointer group/seek"
            style={{ height: 16, display: 'flex', alignItems: 'center' }}
            onMouseDown={handleSeekDown}
          >
            {/* Track */}
            <div
              className="absolute inset-x-0 rounded-full bg-white/20 transition-[height] duration-150 group-hover/seek:h-[5px]"
              style={{ top: '50%', height: 3, transform: 'translateY(-50%)' }}
            >
              {/* Buffered */}
              <div
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-[width] duration-300"
                style={{ width: `${bufferedPct}%` }}
              />
              {/* Played */}
              <div
                className="absolute inset-y-0 left-0 bg-yellow-2 rounded-full"
                style={{ width: `${playedPct}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-2 rounded-full shadow-md pointer-events-none opacity-0 group-hover/seek:opacity-100 transition-opacity"
              style={{ left: `${playedPct}%` }}
            />
          </div>

          {/* ── Controls row ──────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5">
            {/* Play / Pause */}
            <CtrlBtn
              label={playing ? 'Pause' : 'Play'}
              shortcut="Space / K"
              onClick={() => {
                const v = videoRef.current
                if (!v) return
                if (v.paused) { v.play().catch(() => {}); showFlash('▶') }
                else { v.pause(); showFlash('⏸') }
              }}
            >
              {playing ? <IconPause /> : <IconPlay />}
            </CtrlBtn>

            {/* Mute */}
            <CtrlBtn
              label={volDisplay === 0 ? 'Unmute' : 'Mute'}
              shortcut="M"
              onClick={() => {
                const v = videoRef.current
                if (!v) return
                v.muted = !v.muted
                showFlash(v.muted ? '🔇  Muted' : '🔊  Unmuted')
              }}
            >
              {volDisplay === 0
                ? <IconVolumeMuted />
                : volDisplay < 0.5
                ? <IconVolumeLow />
                : <IconVolumeHigh />}
            </CtrlBtn>

            {/* Volume slider */}
            <div className="flex items-center mx-1.5">
              <input
                type="range"
                min={0} max={1} step={0.02}
                value={volDisplay}
                onChange={(e) => handleVolume(+e.target.value)}
                className="w-[72px] accent-yellow-2 cursor-pointer"
                style={{ height: 3 }}
                title={`Volume ${Math.round(volDisplay * 100)}%`}
              />
            </div>

            {/* Time */}
            <span className="text-[11px] font-mono text-white/50 select-none pl-0.5 tabular-nums">
              {fmtTime(currentTime)}
              <span className="text-white/25 mx-1">/</span>
              {fmtTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Playback speed */}
            <div className="relative">
              <CtrlBtn
                label="Playback Speed"
                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu((v) => !v) }}
              >
                <span className="text-xs font-oswald tracking-wider w-8 text-center inline-block">
                  {Number.isInteger(speed) ? `${speed}×` : `${speed}×`}
                </span>
              </CtrlBtn>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-1 bg-[#111]/97 backdrop-blur-sm border border-white/10 rounded-md overflow-hidden z-50">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const v = videoRef.current
                        if (v) v.playbackRate = s
                        showFlash(`${s}×`)
                        setShowSpeedMenu(false)
                      }}
                      className={`w-full text-right px-4 py-[7px] text-[11px] font-oswald tracking-wider transition-colors ${
                        speed === s
                          ? 'text-yellow-2 bg-yellow-2/10'
                          : 'text-white/60 hover:text-white hover:bg-white/8'
                      }`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PiP */}
            {pipSupported && (
              <CtrlBtn
                label="Picture in Picture"
                shortcut={mac ? '⌃P' : 'P'}
                onClick={() => {
                  const v = videoRef.current
                  if (!v) return
                  if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {})
                  else v.requestPictureInPicture().catch(() => {})
                }}
              >
                <IconPiP />
              </CtrlBtn>
            )}

            {/* Fullscreen */}
            <CtrlBtn
              label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              shortcut="F"
              onClick={() => {
                const c = containerRef.current
                if (!c) return
                if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
                else c.requestFullscreen().catch(() => {})
              }}
            >
              {isFullscreen ? <IconExitFullscreen /> : <IconEnterFullscreen />}
            </CtrlBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
