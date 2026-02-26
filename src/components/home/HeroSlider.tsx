'use client'
import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HomeSlide } from '@/types'

const XEN_EASE = [0.76, 0, 0.24, 1] as const
const AUTO_INTERVAL = 7000

const textVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? '110%' : '-110%', opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { duration: 0.75, ease: XEN_EASE } },
  exit: (dir: number) => ({ y: dir > 0 ? '-110%' : '110%', opacity: 0, transition: { duration: 0.55, ease: XEN_EASE } }),
}

const categoryVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
}

function WordReveal({ text, className }: { text: string; className: string }) {
  const words = text.split(' ')
  return (
    <h1 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.25em' }}>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.65, delay: i * 0.1, ease: XEN_EASE }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}

export default function HeroSlider({ slides }: { slides: HomeSlide[] }) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const total = slides.length

  const goNext = useCallback(() => {
    setDir(1)
    setIdx((i) => (i + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setDir(-1)
    setIdx((i) => (i - 1 + total) % total)
  }, [total])

  useEffect(() => {
    const timer = setInterval(goNext, AUTO_INTERVAL)
    return () => clearInterval(timer)
  }, [goNext])

  if (!slides.length) return null
  const current = slides[idx]

  return (
    <div className="home-container">
      {/* Background video */}
      <iframe
        key={current.videoId}
        className="video-back"
        src={`https://www.youtube.com/embed/${current.videoId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=0&showinfo=0&rel=0&disablekb=1&playlist=${current.videoId}`}
        title="Hero background video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />

      <div className="video-overlay" />

      {/* Hero text */}
      <div className="hero-content">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={`slide-${idx}`} custom={dir} variants={textVariants} initial="enter" animate="center" exit="exit">
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
            >
              {current.subtitle}
            </motion.p>
            <WordReveal text={current.title} className="hero-title" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide counter */}
      <div className="slide-counter">
        <AnimatePresence mode="wait">
          <motion.span
            key={`num-${idx}`}
            className="counter-current"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {`0${idx + 1}`}
          </motion.span>
        </AnimatePresence>
        <span className="counter-divider" />
        <span className="counter-total">{`0${total}`}</span>
      </div>

      {/* Category label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`cat-${idx}`}
          className="video-category"
          variants={categoryVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {current.category}
        </motion.div>
      </AnimatePresence>

      {/* Progress bar */}
      <motion.div
        key={`bar-${idx}`}
        className="slide-progress"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: AUTO_INTERVAL / 1000, ease: 'linear' }}
        style={{ width: '100%' }}
      />

      {/* Nav arrows */}
      <div className="video-change-panel">
        <button className="change-button" onClick={goPrev} aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button className="change-button" onClick={goNext} aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
