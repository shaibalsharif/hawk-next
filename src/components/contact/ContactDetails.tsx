'use client'

import { motion } from 'framer-motion'
import type { ContactItem, SocialLink } from '@/types'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

interface Props {
  items: ContactItem[]
  social: SocialLink[]
}

const typeLabel: Record<string, string> = {
  EMAIL: 'Email Us',
  PHONE: 'Call Us',
  ADDRESS: 'Visit Us',
}

const typeIcon: Record<string, React.ReactNode> = {
  EMAIL: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  PHONE: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
    </svg>
  ),
  ADDRESS: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  ),
}

export default function ContactDetails({ items, social }: Props) {
  const grouped = items.reduce<Record<string, ContactItem[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = []
    acc[item.type].push(item)
    return acc
  }, {})

  return (
    <div className="bg-dark-1 py-28 px-4 md:px-[10%]">
      {/* Contact grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
        {(['EMAIL', 'PHONE', 'ADDRESS'] as const).map((type, i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: XEN_EASE }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-yellow-2 mb-4">
              {typeIcon[type]}
              <p className="text-sm uppercase tracking-widest">{typeLabel[type]}</p>
            </div>
            {(grouped[type] ?? []).map((item) => (
              <p key={item.id} className="text-white/70 text-sm leading-relaxed">{item.value}</p>
            ))}
            {!grouped[type]?.length && (
              <p className="text-white/30 text-sm">—</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Social links */}
      {social.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-6">Follow Us</p>
          <div className="flex flex-wrap gap-4">
            {social.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="xen-btn text-white"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
