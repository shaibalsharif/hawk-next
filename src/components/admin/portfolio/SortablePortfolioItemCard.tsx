'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isVideoMeta } from '@/lib/media'
import type { PortfolioItem, MediaMeta } from '@/types'

function GripIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
    </svg>
  )
}

interface Props {
  item: PortfolioItem
  onEdit: () => void
  onDelete: () => void
}

export default function SortablePortfolioItemCard({ item, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const imgUrl = item.coverMeta ? (item.coverMeta as MediaMeta).url : null

  return (
    <div ref={setNodeRef} style={style} className="bg-dark-3 rounded-lg overflow-hidden flex flex-col group">
      <div className="aspect-video relative bg-dark-2 overflow-hidden flex-shrink-0">
        {imgUrl ? (
          isVideoMeta(item.coverMeta) ? (
            <video src={imgUrl} muted playsInline className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}
        <button
          {...attributes} {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded text-white/50 hover:text-white hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripIcon />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="font-oswald text-white tracking-wide leading-tight truncate">{item.title}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {item.client}{item.client && item.year ? ' · ' : ''}{item.year}
          </p>
        </div>
        <div className="flex gap-2 mt-auto">
          <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/5 hover:bg-yellow-2/10 text-white/60 hover:text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded transition-colors border border-white/10 hover:border-yellow-2/30">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            Edit
          </button>
          <button onClick={onDelete} className="p-2 bg-white/5 hover:bg-red-500/10 text-white/30 hover:text-red-400 rounded transition-colors border border-white/10 hover:border-red-500/20" title="Delete">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
