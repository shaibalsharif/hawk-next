'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

const XEN_EASE = [0.76, 0, 0.24, 1] as const

const overlayVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.65, ease: XEN_EASE } },
  exit: { x: '100%', transition: { duration: 0.55, ease: XEN_EASE } },
}

const linksContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
}

const linkItemVariants = {
  hidden: { x: -60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.55, ease: XEN_EASE } },
  exit: { x: -40, opacity: 0, transition: { duration: 0.3 } },
}

const imageVariants = {
  enter: { opacity: 0, scale: 1.06 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, scale: 1.03, transition: { duration: 0.4 } },
}

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admin', href: '/admin' },
]

const NAV_IMAGES = [
  '/images/jabir.jpg',
  '/images/ahmed.jpg',
  '/images/m.jpg',
  '/images/rafiz.jpg',
  '/images/rakibul.jpg',
]

interface NavOverlayProps {
  onClose: () => void
}

export default function NavOverlay({ onClose }: NavOverlayProps) {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setImgIdx((i) => (i + 1) % NAV_IMAGES.length), 2500)
    return () => clearInterval(t)
  }, [])

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      className="nav-container"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="flex h-screen">
        {/* Left image panel (desktop only) */}
        <div className="hidden md:block relative w-[45%] overflow-hidden flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={imgIdx}
              className="absolute inset-0"
              variants={imageVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Image
                src={NAV_IMAGES[imgIdx]}
                alt=""
                fill
                className="object-cover"
                sizes="45vw"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Right links panel */}
        <div className="relative flex-1 flex flex-col">
          {/* Header row */}
          <div className="nav-header">
            <Image src="/images/logo.png" alt="Hawk" width={120} height={48} className="h-8 w-auto object-contain" />
            <motion.button
              onClick={onClose}
              aria-label="Close menu"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
              className="w-12 h-12 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>

          {/* Nav links */}
          <motion.ul
            className="nav-link-container"
            variants={linksContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {NAV_LINKS.map((link) => (
              <motion.li key={link.name} variants={linkItemVariants}>
                <Link
                  href={link.href}
                  className="nav-link"
                  onClick={onClose}
                  data-hover
                >
                  {link.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          {/* Social links */}
          <motion.div
            className="absolute bottom-8 left-[clamp(2rem,8vw,6rem)] flex gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {['Instagram', 'Facebook', 'Vimeo', 'Behance'].map((s) => (
              <span
                key={s}
                className="text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-yellow-2 transition-colors duration-300"
                data-hover
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
