'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { PortfolioItem, PortfolioImage } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  item: PortfolioItem
  images: PortfolioImage[]
}

export default function PortfolioDetail({ item, images }: Props) {
  const coverUrl = getMediaUrl(item.coverMeta)

  return (
    <div>
      {/* Cover */}
      <div className="relative h-screen flex items-end overflow-hidden">
        {coverUrl && (
          <motion.img
            src={coverUrl}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: XEN_EASE }}
          />
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
        <div className="bg-white min-h-screen py-12 px-4 space-y-4">
          {images.map((img, i) => (
            <motion.img
              key={img.id}
              src={getMediaUrl(img.imageMeta)}
              alt={`Gallery ${i + 1}`}
              className="w-full object-cover"
              initial={{ opacity: 0, scale: 1.02 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.05, ease: XEN_EASE }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
