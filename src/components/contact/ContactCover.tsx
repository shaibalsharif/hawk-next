'use client'

import { motion } from 'framer-motion'
import type { ContactCover } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function ContactCover({ data }: { data: ContactCover | null }) {
  return (
    <div className="relative h-screen flex items-center bg-dark-2 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-1 via-dark-2 to-dark-1" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #fff, #fff 1px, transparent 1px, transparent 60px)' }}
      />

      <div className="relative z-10 px-8 md:px-[10%] w-full">
        <div style={{ overflow: 'hidden' }}>
          <motion.p
            className="text-yellow-2 text-[clamp(1.8rem,7vw,2.5rem)] font-bold tracking-widest uppercase"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: XEN_EASE }}
          >
            {data?.title}
          </motion.p>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <motion.div
            className="text-[clamp(1.8rem,7vw,2.5rem)] sm:text-[55px] font-[700] leading-[1.1] uppercase max-w-[14ch]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.75, delay: 0.45, ease: XEN_EASE }}
          >
            {data?.sub}
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <motion.span
          className="text-[10px] tracking-[0.3em] uppercase"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          SCROLL
        </motion.span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </motion.div>
    </div>
  )
}
