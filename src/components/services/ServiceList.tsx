'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { ServiceItem } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  items: ServiceItem[]
}

export default function ServiceList({ items }: Props) {
  return (
    <div className="uppercase py-28 bg-white text-black min-h-[80vh]">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.75, ease: XEN_EASE }}
      >
        <p className="text-[clamp(2rem,8vw,3.75rem)] font-bold">Our Services</p>
        <p className="text-xs font-normal tracking-widest mt-2 text-black/50">What we offer</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 px-[10%] md:px-[20%] gap-10">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="shadow-md overflow-hidden group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: XEN_EASE }}
            whileHover={{ y: -6 }}
          >
            <div className="h-60 bg-slate-400/10 overflow-hidden">
              <motion.img
                src={getMediaUrl(item.imageMeta) || ''}
                alt={item.name}
                className="h-full w-full object-contain mx-auto transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="px-4 space-y-2 py-4 bg-[#a7a7a72f] transition-colors duration-300 group-hover:bg-[#a7a7a750]">
              <p className="font-[600] tracking-wide">{item.name}</p>
              <p className="normal-case font-[300] text-sm leading-relaxed">{item.details}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
