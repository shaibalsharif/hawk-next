'use client'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { HomeSlide } from '@/types'
import { extractYouTubeId } from '@/lib/media'
import ConfirmModal from './ConfirmModal'

interface Props { initialSlides: HomeSlide[] }

// ── Slide form modal ─────────────────────────────────────────────────────────

function SlideForm({
  slide,
  onSave,
  onClose,
}: {
  slide: Partial<HomeSlide>
  onSave: (data: Partial<HomeSlide>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    videoId: slide.videoId ?? '',
    title: slide.title ?? '',
    subtitle: slide.subtitle ?? '',
    category: slide.category ?? '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = () => {
    const id = extractYouTubeId(form.videoId) ?? form.videoId
    onSave({ ...form, videoId: id })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md space-y-4 my-8">
          <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">
            {slide.id ? 'Edit Slide' : 'New Slide'}
          </h3>

          {[
            { key: 'videoId', label: 'YouTube URL or Video ID', placeholder: 'F982x43JYH8 or full URL' },
            { key: 'title', label: 'Title', placeholder: 'HAWK CREATIVE STUDIOS' },
            { key: 'subtitle', label: 'Subtitle', placeholder: 'WE CREATE VISUAL STORIES' },
            { key: 'category', label: 'Category Label', placeholder: 'FPV CINEMATOGRAPHY' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1">{label}</label>
              <input
                value={form[key as keyof typeof form]}
                onChange={set(key as keyof typeof form)}
                placeholder={placeholder}
                className="w-full bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"
              />
            </div>
          ))}

          {form.videoId && (
            <div className="rounded overflow-hidden bg-dark-3">
              <iframe
                src={`https://www.youtube.com/embed/${extractYouTubeId(form.videoId) ?? form.videoId}?mute=1`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay"
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-white/20 text-white/60 text-xs font-oswald tracking-wider uppercase rounded hover:border-white/40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sortable card ────────────────────────────────────────────────────────────

function SortableCard({
  slide,
  index,
  onEdit,
  onDelete,
}: {
  slide: HomeSlide
  index: number
  onEdit: (slide: HomeSlide) => void
  onDelete: (slide: HomeSlide) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto' as React.CSSProperties['zIndex'],
  }

  const num = String(index + 1).padStart(2, '0')

  return (
    <div ref={setNodeRef} style={style} className="bg-dark-2 rounded-lg overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-3 flex-shrink-0">
        <img
          src={`https://img.youtube.com/vi/${slide.videoId}/mqdefault.jpg`}
          alt={slide.title}
          className="w-full h-full object-cover"
        />

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded text-white/50 hover:text-white hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
          </svg>
        </button>

        {/* Order number overlay */}
        <div className="absolute bottom-0 left-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent w-full">
          <span className="text-5xl font-oswald font-bold text-yellow-2 leading-none select-none">
            {num}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3 flex-1 space-y-0.5">
        <p className="text-[10px] font-oswald tracking-widest uppercase text-yellow-2/70">{slide.category}</p>
        <p className="text-white font-oswald text-sm tracking-wide leading-snug">{slide.title}</p>
        <p className="text-white/40 text-xs">{slide.subtitle}</p>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-white/5">
        <button
          onClick={() => onEdit(slide)}
          className="flex-1 py-2.5 text-xs font-oswald tracking-wider uppercase text-white/40 hover:text-yellow-2 hover:bg-yellow-2/5 transition-colors border-r border-white/5"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(slide)}
          className="flex-1 py-2.5 text-xs font-oswald tracking-wider uppercase text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

// ── Main editor ──────────────────────────────────────────────────────────────

export default function HomeEditor({ initialSlides }: Props) {
  const [slides, setSlides] = useState<HomeSlide[]>(initialSlides)
  const [editing, setEditing] = useState<Partial<HomeSlide> | null>(null)
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<HomeSlide | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const flash = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const save = async (updatedSlides: HomeSlide[]) => {
    setSaving(true)
    try {
      const res = await fetch('/api/content/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: updatedSlides }),
      })
      const data = await res.json()
      setSlides(data)
      setIsDirty(false)
      flash('Saved!')
    } catch {
      flash('Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = slides.findIndex((s) => s.id === active.id)
    const newIndex = slides.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(slides, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }))
    setSlides(reordered)
    setIsDirty(true)
  }

  const handleSaveSlide = async (formData: Partial<HomeSlide>) => {
    let updated: HomeSlide[]
    if (editing?.id) {
      updated = slides.map((s) => (s.id === editing.id ? { ...s, ...formData } : s))
    } else {
      const res = await fetch('/api/content/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const newSlide = await res.json()
      updated = [...slides, newSlide]
    }
    setSlides(updated)
    setEditing(null)
    if (editing?.id) await save(updated)
  }

  const confirmDeleteSlide = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch('/api/content/home', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id }),
    })
    setSlides((s) => s.filter((x) => x.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Home Slides</h2>
          <p className="text-xs text-white/40 mt-1">
            Drag cards to reorder. Save order when ready.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {isDirty && (
            <button
              onClick={() => save(slides)}
              disabled={saving}
              className="px-5 py-2 bg-dark-3 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/10 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Order'}
            </button>
          )}
          <button
            onClick={() => setEditing({})}
            className="px-5 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors"
          >
            + Add Slide
          </button>
        </div>
      </div>

      {msg && (
        <p className={`text-xs font-oswald tracking-wider ${msg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {msg}
        </p>
      )}

      {/* Card grid */}
      {slides.length === 0 ? (
        <div className="text-center py-20 text-white/30 font-oswald tracking-widest uppercase text-sm">
          No slides yet — add your first YouTube video
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={slides.map((s) => s.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map((slide, i) => (
                <SortableCard
                  key={slide.id}
                  slide={slide}
                  index={i}
                  onEdit={setEditing}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit / New modal */}
      <AnimatePresence>
        {editing !== null && (
          <SlideForm
            slide={editing}
            onSave={handleSaveSlide}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Slide"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={confirmDeleteSlide}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
