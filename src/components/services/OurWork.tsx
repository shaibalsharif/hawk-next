'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { ServicesInner } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function OurWork({ data }: { data: ServicesInner | null }) {
  const imgUrl = getMediaUrl(data?.imageMeta)

  return (
    <div className="py-20 bg-dark-1 px-[10%]">
      <motion.p
        className="uppercase text-[clamp(1.8rem,6vw,3rem)] text-yellow-2 font-bold text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: XEN_EASE }}
      >
        {data?.title}
      </motion.p>

      {imgUrl && (
        <div className="img-reveal-wrap my-16 px-8">
          <motion.img
            src={imgUrl}
            alt="Our work"
            className="w-full"
            initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.05 }}
            whileInView={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: XEN_EASE }}
          />
        </div>
      )}

      <div className="px-4 sm:px-8 text-yellow-2 text-xl sm:text-2xl font-semibold tracking-widest text-center md:text-start md:flex md:px-[10%] items-start gap-8">
        <div className="w-full">
          <p>{data?.sub}</p>
        </div>
        <div className="text-white text-sm font-normal text-justify mt-4 md:mt-0">
          {data?.details}
        </div>
      </div>
    </div>
  )
}
