'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  colSpan: number
  rowSpan: number
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

/** Draggable tile in the layout preview grid inside ItemModal. */
export default function SortablePreviewTile({ id, colSpan, rowSpan, isActive, onMouseEnter, onMouseLeave }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`rounded-sm border transition-colors duration-150 cursor-grab active:cursor-grabbing select-none ${
        isDragging
          ? 'opacity-40 bg-yellow-2/25 border-yellow-2/40'
          : isActive
          ? 'bg-yellow-2/60 border-yellow-2'
          : 'bg-yellow-2/25 border-yellow-2/40'
      }`}
      style={{
        gridColumn: `span ${Math.min(colSpan, 3)}`,
        gridRow: `span ${Math.min(rowSpan, 3)}`,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}
