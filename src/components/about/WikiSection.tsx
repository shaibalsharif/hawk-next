'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const XEN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]
const IMAGE_COUNT = 10

export default function WikiSection() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [scrollStart, setScrollStart] = useState(0)

  const scroll = (dir: number) => {
    if (!sliderRef.current) return
    const w = (sliderRef.current.children[0] as HTMLElement)?.offsetWidth || 300
    sliderRef.current.scrollLeft += dir * w
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setScrollStart(sliderRef.current?.scrollLeft ?? 0)
    setDragStartX(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartX === null || !sliderRef.current) return
    const delta = e.clientX - dragStartX
    const w = (sliderRef.current.children[0] as HTMLElement)?.offsetWidth || 1
    sliderRef.current.scrollLeft = scrollStart - Math.round(delta / w) * w
  }

  const handleMouseUp = () => setDragStartX(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setScrollStart(sliderRef.current?.scrollLeft ?? 0)
    setDragStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null || !sliderRef.current) return
    const delta = e.touches[0].clientX - dragStartX
    sliderRef.current.scrollLeft = scrollStart - delta
  }

  const handleTouchEnd = () => setDragStartX(null)

  return (
    <div className="w-full py-20 px-4 bg-white">
      <div style={{ overflow: 'hidden' }}>
        <motion.h2
          className="uppercase text-center text-dark-3 text-[clamp(2rem,5vw,3.5rem)] font-[600] -tracking-[2px] py-8 mb-10"
          initial={{ y: '100%' }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: XEN_EASE }}
        >
          WE ARE CREATIVE
        </motion.h2>
      </div>

      <div className="relative h-[70vh]">
        <div
          ref={sliderRef}
          className="flex h-full overflow-x-auto no-scrollbar gap-2 scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {Array.from({ length: IMAGE_COUNT }, (_, i) => i + 1).map((n, idx) => (
            <motion.img
              key={n}
              src={`/slider/${n}.jpg`}
              alt={`slide ${n}`}
              className="h-full w-auto object-cover flex-shrink-0 select-none"
              style={{ scrollSnapAlign: 'center' }}
              draggable={false}
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: idx * 0.04 }}
            />
          ))}
        </div>

        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            className="bg-transparent text-black border border-black/20 rounded-full w-9 h-9 flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-300"
            onClick={() => scroll(-1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            className="bg-transparent text-black border border-black/20 rounded-full w-9 h-9 flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-300"
            onClick={() => scroll(1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
