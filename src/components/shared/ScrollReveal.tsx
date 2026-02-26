'use client'
import { motion } from 'framer-motion'
import type { ReactNode, ElementType } from 'react'

const XEN_EASE = [0.76, 0, 0.24, 1] as const

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
  duration?: number
  once?: boolean
  className?: string
  as?: ElementType
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 40,
  duration = 0.8,
  once = true,
  className = '',
}: ScrollRevealProps) {
  const initial = {
    opacity: 0,
    y: direction === 'up' ? distance : direction === 'down' ? -distance : 0,
    x: direction === 'left' ? distance : direction === 'right' ? -distance : 0,
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: XEN_EASE }}
    >
      {children}
    </motion.div>
  )
}

interface ImageRevealProps {
  src: string
  alt?: string
  className?: string
  delay?: number
  style?: React.CSSProperties
}

export function ImageReveal({ src, alt = '', className = '', delay = 0, style = {} }: ImageRevealProps) {
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <motion.img
        src={src}
        alt={alt}
        className={className}
        initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.08 }}
        whileInView={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 1.1, delay, ease: XEN_EASE }}
      />
    </div>
  )
}
