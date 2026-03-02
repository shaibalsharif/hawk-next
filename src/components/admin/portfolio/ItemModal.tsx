'use client'
import { useState } from 'react'
import {
  DndContext, PointerSensor, useSensor, useSensors, closestCenter, type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import MediaInput from '../MediaInput'
import ConfirmModal from '../ConfirmModal'
import GalleryImageCard from './GalleryImageCard'
import SortablePreviewTile from './SortablePreviewTile'
import { inputCls, type GalleryImageState } from './shared'
import type { PortfolioItem, PortfolioImage, MediaMeta } from '@/types'

interface Props {
  item: Partial<PortfolioItem>
  categoryId: string
  onSave: (data: Partial<PortfolioItem>) => void
  onClose: () => void
}

export default function ItemModal({ item, categoryId, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: item.title ?? '',
    client: item.client ?? '',
    year: item.year ?? new Date().getFullYear(),
    role: item.role ?? '',
    description: item.description ?? '',
    takeaways: item.takeaways ?? [''],
    coverMeta: item.coverMeta ?? null as MediaMeta | null,
  })
  const [tab, setTab] = useState<'details' | 'gallery'>('details')
  const [images, setImages] = useState<Partial<PortfolioImage>[]>(item.images ?? [])
  const [liveStates, setLiveStates] = useState<Record<string, GalleryImageState>>(() =>
    Object.fromEntries(
      (item.images ?? []).filter((img) => img.id).map((img) => [
        img.id!,
        {
          hidden: img.hidden ?? false,
          colSpan: img.colSpan ?? 1,
          rowSpan: img.rowSpan ?? 1,
          objectFit: img.objectFit ?? 'cover',
          objectPosition: img.objectPosition ?? 'center',
        },
      ])
    )
  )
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null)
  const [newImage, setNewImage] = useState<MediaMeta | null>(null)
  const [deleteImageTarget, setDeleteImageTarget] = useState<string | null>(null)
  const [deletingImage, setDeletingImage] = useState(false)

  const handleStateChange = (id: string, s: GalleryImageState) =>
    setLiveStates((prev) => ({ ...prev, [id]: s }))

  const previewSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const imageIds = images.filter((img) => img.id).map((img) => img.id!)

  const handlePreviewDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = images.findIndex((img) => img.id === active.id as string)
    const newIdx = images.findIndex((img) => img.id === over.id as string)
    if (oldIdx === -1 || newIdx === -1) return
    const reordered = arrayMove([...images], oldIdx, newIdx)
    setImages(reordered)
    const order = reordered.filter((img) => img.id).map((img, i) => ({ id: img.id!, displayOrder: i }))
    await fetch('/api/content/portfolio', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', order }),
    })
  }

  const setTakeaway = (i: number, v: string) =>
    setForm((f) => { const t = [...f.takeaways]; t[i] = v; return { ...f, takeaways: t } })
  const addTakeaway = () => setForm((f) => ({ ...f, takeaways: [...f.takeaways, ''] }))
  const removeTakeaway = (i: number) => setForm((f) => ({ ...f, takeaways: f.takeaways.filter((_, j) => j !== i) }))

  const addImage = async () => {
    if (!newImage || !item.id) return
    const res = await fetch('/api/content/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'image', data: { itemId: item.id, imageMeta: newImage } }),
    })
    const created = await res.json()
    setImages((imgs) => [...imgs, created])
    if (created.id) {
      setLiveStates((prev) => ({
        ...prev,
        [created.id]: { hidden: false, colSpan: 1, rowSpan: 1, objectFit: 'cover', objectPosition: 'center' },
      }))
    }
    setNewImage(null)
  }

  const confirmRemoveImage = async () => {
    if (!deleteImageTarget) return
    setDeletingImage(true)
    await fetch(`/api/content/portfolio/${deleteImageTarget}?type=image`, { method: 'DELETE' })
    setImages((imgs) => imgs.filter((x) => x.id !== deleteImageTarget))
    setLiveStates((prev) => { const n = { ...prev }; delete n[deleteImageTarget]; return n })
    setDeletingImage(false)
    setDeleteImageTarget(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-dark-2 rounded-lg w-full max-w-6xl my-8">

          {/* Tab bar */}
          <div className="flex gap-1 p-1 bg-dark-3 rounded-t-lg">
            {(['details', 'gallery'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 py-2 text-xs font-oswald tracking-wider uppercase rounded transition-colors ${tab === t ? 'bg-yellow-2 text-dark-1' : 'text-white/50 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            {/* ── Details tab ── */}
            {tab === 'details' && (
              <>
                <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">
                  {item.id ? 'Edit Item' : 'New Portfolio Item'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Title</label>
                    <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Client</label>
                    <input value={form.client} onChange={(e) => setForm((f) => ({ ...f, client: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Year</label>
                    <input type="number" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: +e.target.value }))} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Role</label>
                    <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputCls} h-24 resize-none`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Takeaways</label>
                  {form.takeaways.map((t, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input value={t} onChange={(e) => setTakeaway(i, e.target.value)} className={inputCls} placeholder="e.g. Brand Identity" />
                      <button type="button" onClick={() => removeTakeaway(i)} className="text-white/30 hover:text-red-400 transition-colors px-2">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={addTakeaway} className="text-xs text-yellow-2 font-oswald tracking-wider uppercase hover:text-yellow-2/80 transition-colors">
                    + Add Point
                  </button>
                </div>

                <MediaInput value={form.coverMeta} onChange={(v) => setForm((f) => ({ ...f, coverMeta: v }))} label="Cover Media" accept="any" />
              </>
            )}

            {/* ── Gallery tab ── */}
            {tab === 'gallery' && (
              <div className="flex gap-5 items-start">
                {/* Sticky layout preview (draggable to reorder) */}
                {images.length > 0 && (
                  <div className="w-44 flex-shrink-0 sticky top-0">
                    <p className="text-[10px] font-oswald tracking-widest uppercase text-white/30 mb-2">Layout Preview</p>
                    <div className="bg-dark-3 rounded p-2">
                      <DndContext sensors={previewSensors} collisionDetection={closestCenter} onDragEnd={handlePreviewDragEnd}>
                        <SortableContext items={imageIds} strategy={rectSortingStrategy}>
                          <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '22px' }}>
                            {images.map((img, i) => {
                              const live = img.id ? (liveStates[img.id] ?? img) : img
                              if (live.hidden) return null
                              if (!img.id) return <div key={i} />
                              return (
                                <SortablePreviewTile
                                  key={img.id}
                                  id={img.id}
                                  colSpan={live.colSpan ?? 1}
                                  rowSpan={live.rowSpan ?? 1}
                                  isActive={hoveredImageId === img.id}
                                  onMouseEnter={() => setHoveredImageId(img.id!)}
                                  onMouseLeave={() => setHoveredImageId(null)}
                                />
                              )
                            })}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                )}

                {/* Gallery cards */}
                <div className="flex-1 min-w-0 space-y-3">
                  <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">Gallery</h3>
                  {!item.id && (
                    <p className="text-xs text-white/40">Save the item first before adding gallery images.</p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, i) => (
                      <GalleryImageCard
                        key={img.id ?? i}
                        img={img}
                        onDelete={() => img.id && setDeleteImageTarget(img.id)}
                        onStateChange={handleStateChange}
                        isHovered={hoveredImageId === img.id}
                        onHoverChange={(h) => setHoveredImageId(h ? (img.id ?? null) : null)}
                      />
                    ))}
                  </div>

                  {item.id && (
                    <div className="space-y-2">
                      <MediaInput value={newImage} onChange={setNewImage} label="Add Image" />
                      {newImage && (
                        <button type="button" onClick={addImage}
                          className="w-full py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
                          Add to Gallery
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save / Close */}
            <div className="flex gap-3 pt-2">
              <button type="button"
                onClick={() => onSave({
                  ...form,
                  categoryId,
                  images: images.map((img) => ({
                    ...img,
                    ...(img.id ? liveStates[img.id] ?? {} : {}),
                  })) as PortfolioImage[],
                })}
                className="flex-1 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors"
              >
                Save
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-2 border border-white/20 text-white/60 text-xs font-oswald tracking-wider uppercase rounded hover:border-white/40 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteImageTarget !== null}
        title="Delete Image"
        message="Remove this image from the gallery? This cannot be undone."
        onConfirm={confirmRemoveImage}
        onCancel={() => setDeleteImageTarget(null)}
        loading={deletingImage}
        danger
      />
    </div>
  )
}
