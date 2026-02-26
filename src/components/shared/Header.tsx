'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import NavOverlay from './NavOverlay'

export default function Header() {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <>
      <div className="header-container">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Hawk Creative Studios"
            width={160}
            height={64}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <motion.button
          onClick={() => setIsNavOpen(true)}
          aria-label="Open menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          data-hover
          className="text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="nav-open"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </motion.button>
      </div>

      <AnimatePresence>
        {isNavOpen && <NavOverlay onClose={() => setIsNavOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
