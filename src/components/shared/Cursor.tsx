'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useMotionValue, useSpring, useTransform, motion, type MotionValue } from 'framer-motion'

const INTERACTIVE =
  'a, button, [role="button"], .nav-link, .change-button, [data-hover], input, textarea, select, label'

export default function Cursor() {
  const pathname = usePathname()

  // ── Position ──────────────────────────────────────────────────────────────
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)

  const dotX = useSpring(mouseX, { damping: 100, stiffness: 2000 })
  const dotY = useSpring(mouseY, { damping: 100, stiffness: 2000 })
  const ringX = useSpring(mouseX, { damping: 28, stiffness: 180 })
  const ringY = useSpring(mouseY, { damping: 28, stiffness: 180 })

  // ── Interaction state ─────────────────────────────────────────────────────
  const isHovering = useMotionValue(0)
  const isClicking = useMotionValue(0)

  // ── Reactive derived values ───────────────────────────────────────────────
  // Dot shrinks on click
  const dotScaleRaw = useTransform(isClicking, [0, 1], [1, 0.4])
  const dotScale = useSpring(dotScaleRaw, { damping: 20, stiffness: 400 })

  // Ring: expands on hover, shrinks on click
  const ringScaleRaw = useTransform(
    [isHovering, isClicking] as MotionValue<number>[],
    ([h, c]: number[]): number => (h ? 2.2 : c ? 0.7 : 1),
  )
  const ringScale = useSpring(ringScaleRaw, { damping: 20, stiffness: 200 })

  // Ring colour: white at rest → yellow on hover
  const ringColor = useTransform(
    isHovering,
    [0, 1],
    ['rgba(255,255,255,0.45)', 'rgba(252,218,2,0.8)'],
  )

  // Ring opacity: slightly dimmer when expanded
  const ringOpacity = useTransform(isHovering, [0, 1], [1, 0.7])

  // ── Event listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    const onOver = (e: MouseEvent) => {
      const el = e.target as Element
      isHovering.set(el.closest(INTERACTIVE) ? 1 : 0)
    }
    const onDown = () => isClicking.set(1)
    const onUp = () => isClicking.set(0)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
    }
  }, [mouseX, mouseY, isHovering, isClicking])

  // On admin/login pages render nothing — the native cursor is restored via
  // CSS (.native-cursor). All hooks above still run so position stays live.
  const hidden =
    pathname === '/login' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/admin')
  if (hidden) return null

  return (
    <>
      {/* Small yellow dot — snaps instantly to mouse */}
      <motion.div
        className="cursor-dot"
        style={{ x: dotX, y: dotY, scale: dotScale }}
      />

      {/* Lagging ring — reacts to hover and click */}
      <motion.div
        className="cursor-ring"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          borderColor: ringColor,
          opacity: ringOpacity,
        }}
      />
    </>
  )
}
