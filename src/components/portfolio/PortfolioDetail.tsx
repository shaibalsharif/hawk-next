'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getMediaUrl, isVideoMeta } from '@/lib/media'
import type { PortfolioItem, PortfolioImage } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const PAGE_SIZE = 9

interface Props {
  item: PortfolioItem
  images: PortfolioImage[]
}

// ── Lightbox ────────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: PortfolioImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const img = images[index]
  const url = getMediaUrl(img.imageMeta)
  const isVideo = isVideoMeta(img.imageMeta)
  const total = images.length

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-oswald tracking-widest text-white/50 uppercase">
        {index + 1} / {total}
      </div>

      {/* Close */}
      <button
        className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          aria-label="Previous"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next */}
      {total > 1 && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/40 hover:text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          aria-label="Next"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={img.id}
          className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {isVideo ? (
            <video
              src={url}
              controls
              autoPlay
              playsInline
              className="max-w-full max-h-[85vh] rounded"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={`Gallery ${index + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────────

export default function PortfolioDetail({ item, images }: Props) {
  const coverUrl = getMediaUrl(item.coverMeta)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const shownImages = images.slice(0, visible)
  const hasMore = visible < images.length

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevImage = useCallback(() =>
    setLightboxIndex((i) => i !== null ? (i - 1 + images.length) % images.length : null),
    [images.length]
  )
  const nextImage = useCallback(() =>
    setLightboxIndex((i) => i !== null ? (i + 1) % images.length : null),
    [images.length]
  )

  return (
    <div>
      {/* Cover */}
      <div className="relative h-screen flex items-end overflow-hidden">
        {coverUrl && (
          isVideoMeta(item.coverMeta) ? (
            <video
              src={coverUrl}
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <motion.img
              src={coverUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: XEN_EASE }}
            />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-1 via-dark-1/40 to-transparent" />

        <div className="relative z-10 px-8 md:px-[10%] pb-16 w-full">
          <div style={{ overflow: 'hidden' }}>
            <motion.h1
              className="text-[clamp(2rem,6vw,5rem)] font-[700] uppercase leading-tight"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: XEN_EASE }}
            >
              {item.title}
            </motion.h1>
          </div>
          <motion.div
            className="flex flex-wrap gap-8 mt-4 text-xs text-white/60 uppercase tracking-widest"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <span>Client: <span className="text-yellow-2">{item.client}</span></span>
            <span>Year: <span className="text-yellow-2">{item.year}</span></span>
            <span>Role: <span className="text-yellow-2">{item.role}</span></span>
          </motion.div>
        </div>
      </div>

      {/* Description + takeaways */}
      <div className="bg-dark-1 py-24 px-8 md:px-[10%]">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          {item.takeaways.length > 0 && (
            <ul className="space-y-3 md:w-1/3 flex-shrink-0">
              {item.takeaways.map((point, i) => (
                <motion.li
                  key={i}
                  className="text-yellow-2 text-xs uppercase tracking-widest flex items-start gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                >
                  <span className="mt-1">—</span>
                  <span className="text-white">{point}</span>
                </motion.li>
              ))}
            </ul>
          )}
          <motion.p
            className="text-white/70 text-sm leading-relaxed text-justify"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {item.description}
          </motion.p>
        </div>
      </div>

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="bg-dark-1 pb-24 px-4 md:px-8">
          {/* Grid */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridAutoRows: '280px',
            }}
          >
            {shownImages.map((img, i) => {
              const url = getMediaUrl(img.imageMeta)
              const isVideo = isVideoMeta(img.imageMeta)
              const priority = i < 3

              return (
                <motion.div
                  key={img.id}
                  className="relative overflow-hidden cursor-pointer rounded-sm group"
                  style={{
                    gridColumn: `span ${Math.min(img.colSpan, 3)}`,
                    gridRow: `span ${Math.min(img.rowSpan, 2)}`,
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: Math.min(i % 3, 2) * 0.06 }}
                  onClick={() => openLightbox(i)}
                >
                  {isVideo ? (
                    <video
                      src={url}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      style={{
                        objectFit: img.objectFit as 'cover' | 'contain',
                        objectPosition: img.objectPosition,
                      }}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={url}
                      alt={`Gallery ${i + 1}`}
                      loading={priority ? undefined : 'lazy'}
                      {...(priority ? { fetchPriority: 'high' } as Record<string, string> : {})}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                      style={{
                        objectFit: img.objectFit as 'cover' | 'contain',
                        objectPosition: img.objectPosition,
                      }}
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
                    </svg>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="px-8 py-3 bg-dark-2 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-widest uppercase rounded hover:bg-yellow-2/10 transition-colors"
              >
                Load More ({images.length - visible} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
