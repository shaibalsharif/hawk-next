'use client'

import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { TeamMember } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  members: TeamMember[]
}

export default function TeamMembers({ members }: Props) {
  return (
    <div className="px-4 w-full bg-dark-2 py-28 md:px-[10%]">
      <motion.p
        className="section-label mb-2"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        The Team
      </motion.p>
      <motion.h2
        className="section-title text-[clamp(1.8rem,4vw,3rem)] mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: XEN_EASE }}
      >
        Meet Our Crew
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, delay: i * 0.1, ease: XEN_EASE }}
          >
            <div className="overflow-hidden">
              <motion.img
                src={getMediaUrl(member.imageMeta) || '/images/placeholder.jpg'}
                alt={member.name}
                className="h-[50vh] max-h-[400px] w-full object-cover"
                initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.07 }}
                whileInView={{ clipPath: 'inset(0% 0 0 0)', scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 1, delay: i * 0.08, ease: XEN_EASE }}
                whileHover={{ scale: 1.04 }}
              />
            </div>
            <div className="py-4 flex flex-col gap-1">
              <p className="uppercase text-sm font-[600] tracking-wider">{member.name}</p>
              <p className="uppercase text-[10px] font-[400] tracking-[5px] text-white/50">
                {member.position}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
