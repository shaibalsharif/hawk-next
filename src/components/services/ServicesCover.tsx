'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { ServicesCover } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  data: ServicesCover | null
  onScrollClick?: () => void
}

export default function ServicesCoverSection({ data, onScrollClick }: Props) {
  const imgUrl = getMediaUrl(data?.imageMeta)

  return (
    <div className="flex items-center bg-dark-2 relative z-0">
      {imgUrl && (
        <motion.img
          src={imgUrl}
          alt="Services cover"
          className="object-cover w-full h-screen absolute top-0 left-0 sm:relative -z-10 sm:z-0 sm:w-full"
          initial={{ clipPath: 'inset(0 0 100% 0)', scale: 1.08 }}
          animate={{ clipPath: 'inset(0 0 0% 0)', scale: 1 }}
          transition={{ duration: 1.2, ease: XEN_EASE }}
        />
      )}

      <div className="h-screen px-8 sm:w-full flex items-center bg-black/25">
        <div className="md:w-[55%]">
          <div style={{ overflow: 'hidden' }}>
            <motion.div
              className="text-[clamp(1.8rem,7vw,2.5rem)] sm:text-[55px] font-[700] leading-[1.1] uppercase"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.75, delay: 0.4, ease: XEN_EASE }}
            >
              {data?.title}
            </motion.div>
          </div>

          <motion.p
            className="text-xs sm:text-sm font-[500] pt-8 uppercase text-white/70"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            {data?.sub}
          </motion.p>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 sm:left-[75%] -translate-x-1/2 sm:-translate-x-2/3 flex flex-col items-center gap-1"
          onClick={onScrollClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{ cursor: 'none' }}
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
    </div>
  )
}
