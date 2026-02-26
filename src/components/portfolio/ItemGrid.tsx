'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { getMediaUrl } from '@/lib/media'
import type { PortfolioItem } from '@/types'

interface Props {
  items: PortfolioItem[]
  categorySlug: string
}

export default function ItemGrid({ items, categorySlug }: Props) {
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

  if (items.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-1">
        <p className="text-white/30 text-sm tracking-widest uppercase">No items in this category yet</p>
      </div>
    )
  }

  return (
    <div className="flex overflow-x-auto no-scrollbar" ref={listRef}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/portfolio/${categorySlug}/${item.id}`}
          className="relative group bg-cover bg-no-repeat bg-center h-screen min-w-full sm:min-w-[50%] md:min-w-[33%] flex-shrink-0"
          style={{ backgroundImage: `url(${getMediaUrl(item.coverMeta)})` }}
        >
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-colors duration-500" />

          {/* Text — always visible on mobile, hover-only on sm+ */}
          <div className="absolute bottom-0 left-0 right-0 sm:inset-auto sm:top-1/2 sm:-translate-y-1/2 sm:left-4 sm:w-[75%] p-5 sm:p-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent sm:bg-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-yellow-2 font-semibold text-sm uppercase tracking-widest mb-1 sm:mb-2">{item.title}</p>
            <p className="text-2xl sm:text-3xl uppercase font-bold leading-tight">{item.client}</p>
            <p className="text-white/50 text-xs tracking-widest mt-1 sm:mt-2">{item.year}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
