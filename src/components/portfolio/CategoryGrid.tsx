'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/media'
import type { PortfolioCategory } from '@/types'

interface Props {
  categories: PortfolioCategory[]
}

export default function CategoryGrid({ categories }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      el.scrollLeft += e.deltaY > 0 ? 5 : -5
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') el.scrollLeft -= 50
      else if (e.key === 'ArrowRight') el.scrollLeft += 50
      else if (e.key === 'ArrowUp') el.scrollLeft -= 50
      else if (e.key === 'ArrowDown') el.scrollLeft += 50
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="flex overflow-x-auto no-scrollbar" ref={listRef}>
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/portfolio/${cat.id.toLowerCase()}`}
          className="relative group bg-cover bg-no-repeat bg-center h-screen min-w-full sm:min-w-[50%] md:min-w-[33%] flex-shrink-0"
          style={{ backgroundImage: `url(${getMediaUrl(cat.imageMeta)})` }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />

          {/* Text — always visible on mobile, hover-only on sm+ */}
          <div className="absolute bottom-0 left-0 right-0 sm:inset-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-4 sm:w-[75%] p-5 sm:p-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:bg-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-yellow-2 font-semibold text-sm uppercase tracking-widest mb-1 sm:mb-2">{cat.name}</p>
            <p className="text-2xl sm:text-3xl uppercase font-bold leading-tight">{cat.details}</p>
          </div>

          {/* Index */}
          <div className="absolute bottom-6 right-6 text-white/30 font-oswald text-6xl font-bold select-none">
            0{i + 1}
          </div>
        </Link>
      ))}
    </div>
  )
}
