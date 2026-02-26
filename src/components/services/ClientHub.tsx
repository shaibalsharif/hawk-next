'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { ClientItem } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  clients: ClientItem[]
}

export default function ClientHub({ clients }: Props) {
  return (
    <div className="min-h-screen bg-dark-2 w-full uppercase flex flex-col justify-center items-start px-4 md:px-[20%] gap-20 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: XEN_EASE }}
      >
        <p className="text-[clamp(2rem,7vw,3rem)] text-yellow-2 tracking-wider font-bold">Our Clients</p>
        <p className="text-sm text-white/50 tracking-widest mt-2">Brands we&apos;ve worked with</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 w-full border-l border-t border-white/10">
        {clients.map((client, i) => (
          <motion.div
            key={client.id}
            className="w-full flex justify-center items-center border-r border-b border-white/10 py-10 px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            {getMediaUrl(client.imageMeta) ? (
              <img
                src={getMediaUrl(client.imageMeta)}
                alt={client.name}
                className="max-h-12 object-contain filter brightness-75 hover:brightness-100 transition-all duration-300"
              />
            ) : (
              <p className="text-white/40 text-xs tracking-widest">{client.name}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
