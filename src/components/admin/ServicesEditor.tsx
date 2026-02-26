'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import MediaInput from './MediaInput'
import ConfirmModal from './ConfirmModal'
import type { ServicesCover, ServicesInner, ServiceItem, ClientItem, MediaMeta } from '@/types'

interface Props {
  initialCover: ServicesCover | null
  initialInner: ServicesInner | null
  initialServices: ServiceItem[]
  initialClients: ClientItem[]
}

const inputCls = "w-full bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-2 rounded-lg p-6 space-y-5">
      <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ── Drag handle icon ─────────────────────────────────────────────────────────

function GripIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 5h16.5M3.75 12h16.5M3.75 19h16.5" />
    </svg>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function ItemModal<T extends { id?: string; name: string; details?: string; imageMeta?: MediaMeta | null }>({
  item, title, onSave, onClose, showDetails = true,
}: {
  item: Partial<T>; title: string
  onSave: (data: Partial<T>) => void; onClose: () => void
  showDetails?: boolean
}) {
  const [form, setForm] = useState({
    name: item.name ?? '',
    details: item.details ?? '',
    imageMeta: item.imageMeta ?? null as MediaMeta | null,
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md space-y-4 my-8">
          <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">{title}</h3>
          <Field label="Name">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </Field>
          {showDetails && (
            <Field label="Details">
              <textarea value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} className={`${inputCls} h-24 resize-none`} />
            </Field>
          )}
          <MediaInput value={form.imageMeta} onChange={(v) => setForm((f) => ({ ...f, imageMeta: v }))} label="Image" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onSave(form as Partial<T>)} className="flex-1 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">Save</button>
            <button type="button" onClick={onClose} className="flex-1 py-2 border border-white/20 text-white/60 text-xs font-oswald tracking-wider uppercase rounded hover:border-white/40 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sortable Service Card ─────────────────────────────────────────────────────

function SortableServiceCard({ svc, onEdit, onDelete }: { svc: ServiceItem; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: svc.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const imgUrl = svc.imageMeta ? (svc.imageMeta as MediaMeta).url : null

  return (
    <div ref={setNodeRef} style={style} className="bg-dark-3 rounded-lg overflow-hidden flex flex-col group">
      <div className="aspect-video relative bg-dark-2 overflow-hidden flex-shrink-0">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          </div>
        )}
        <button {...attributes} {...listeners}
          className="absolute top-2 right-2 p-1.5 bg-black/60 rounded text-white/50 hover:text-white hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripIcon />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col gap-2">
        <p className="font-oswald text-white tracking-wide leading-tight">{svc.name}</p>
        {svc.details && <p className="text-xs text-white/40 line-clamp-2 flex-1">{svc.details}</p>}
      </div>
      <div className="flex border-t border-white/5">
        <button onClick={onEdit} className="flex-1 py-2.5 text-xs font-oswald tracking-wider uppercase text-white/40 hover:text-yellow-2 hover:bg-yellow-2/5 transition-colors border-r border-white/5">Edit</button>
        <button onClick={onDelete} className="flex-1 py-2.5 text-xs font-oswald tracking-wider uppercase text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors">Delete</button>
      </div>
    </div>
  )
}

// ── Sortable Client Card ──────────────────────────────────────────────────────

function SortableClientCard({ cl, onEdit, onDelete }: { cl: ClientItem; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cl.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }
  const imgUrl = cl.imageMeta ? (cl.imageMeta as MediaMeta).url : null

  return (
    <div ref={setNodeRef} style={style} className="bg-dark-3 rounded-lg p-4 flex flex-col items-center gap-3 group">
      <div className="relative w-full">
        <div className="w-16 h-16 rounded-lg bg-dark-2 overflow-hidden flex items-center justify-center mx-auto">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
          )}
        </div>
        <button {...attributes} {...listeners}
          className="absolute top-0 right-0 p-1 bg-black/60 rounded text-white/40 hover:text-white hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <GripIcon />
        </button>
      </div>
      <p className="text-sm font-oswald text-white text-center tracking-wide leading-tight">{cl.name}</p>
      <div className="flex gap-2 w-full">
        <button onClick={onEdit} className="flex-1 py-1.5 text-xs font-oswald tracking-wider uppercase text-white/40 hover:text-yellow-2 hover:bg-yellow-2/5 transition-colors rounded border border-white/10 hover:border-yellow-2/30">Edit</button>
        <button onClick={onDelete} className="px-2 py-1.5 text-xs font-oswald tracking-wider uppercase text-white/30 hover:text-red-400 hover:bg-red-400/5 transition-colors rounded border border-white/10 hover:border-red-400/30">Del</button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ServicesEditor({ initialCover, initialInner, initialServices, initialClients }: Props) {
  const [cover, setCover] = useState<ServicesCover>(initialCover ?? { title: '', sub: '', imageMeta: null })
  const [inner, setInner] = useState<ServicesInner>(initialInner ?? { title: '', sub: '', imageMeta: null, details: '' })
  const [services, setServices] = useState<ServiceItem[]>(initialServices)
  const [clients, setClients] = useState<ClientItem[]>(initialClients)
  const [saving, setSaving] = useState<string | null>(null)
  const [isDirtySvc, setIsDirtySvc] = useState(false)
  const [isDirtyClient, setIsDirtyClient] = useState(false)
  const [msg, setMsg] = useState<{ key: string; text: string; ok: boolean } | null>(null)
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null)
  const [editingClient, setEditingClient] = useState<Partial<ClientItem> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'service' | 'client'; name: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const flash = (key: string, text: string, ok = true) => {
    setMsg({ key, text, ok }); setTimeout(() => setMsg(null), 3000)
  }

  const putSection = async (section: string, data: unknown) => {
    await fetch('/api/content/services', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    })
  }

  const saveCover = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('cover')
    try { await putSection('cover', cover); flash('cover', 'Saved!') }
    catch { flash('cover', 'Error', false) }
    setSaving(null)
  }

  const saveInner = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('inner')
    try { await putSection('inner', inner); flash('inner', 'Saved!') }
    catch { flash('inner', 'Error', false) }
    setSaving(null)
  }

  const saveOrder = async (section: 'service' | 'client', items: { id: string }[]) => {
    setSaving(`order-${section}`)
    try {
      await fetch('/api/content/services', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, order: items.map((x, i) => ({ id: x.id, displayOrder: i })) }),
      })
      if (section === 'service') setIsDirtySvc(false)
      else setIsDirtyClient(false)
      flash(`order-${section}`, 'Order saved!')
    } catch { flash(`order-${section}`, 'Error saving order', false) }
    setSaving(null)
  }

  const handleDragEndSvc = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = services.findIndex((s) => s.id === active.id)
    const newIdx = services.findIndex((s) => s.id === over.id)
    setServices(arrayMove(services, oldIdx, newIdx))
    setIsDirtySvc(true)
  }

  const handleDragEndClient = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = clients.findIndex((c) => c.id === active.id)
    const newIdx = clients.findIndex((c) => c.id === over.id)
    setClients(arrayMove(clients, oldIdx, newIdx))
    setIsDirtyClient(true)
  }

  const handleSaveService = async (data: Partial<ServiceItem>) => {
    if (editingService?.id) {
      const res = await fetch(`/api/content/services/${editingService.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'service', data }),
      })
      const updated = await res.json()
      setServices((s) => s.map((x) => (x.id === editingService.id ? updated : x)))
    } else {
      const res = await fetch('/api/content/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'service', data }),
      })
      const created = await res.json()
      setServices((s) => [...s, created])
    }
    setEditingService(null)
  }

  const handleSaveClient = async (data: Partial<ClientItem>) => {
    if (editingClient?.id) {
      const res = await fetch(`/api/content/services/${editingClient.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'client', data }),
      })
      const updated = await res.json()
      setClients((c) => c.map((x) => (x.id === editingClient.id ? updated : x)))
    } else {
      const res = await fetch('/api/content/services', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'client', data }),
      })
      const created = await res.json()
      setClients((c) => [...c, created])
    }
    setEditingClient(null)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.type === 'service') {
      await fetch(`/api/content/services/${deleteTarget.id}?section=service`, { method: 'DELETE' })
      setServices((s) => s.filter((x) => x.id !== deleteTarget.id))
    } else {
      await fetch(`/api/content/services/${deleteTarget.id}?section=client`, { method: 'DELETE' })
      setClients((c) => c.filter((x) => x.id !== deleteTarget.id))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const msgFor = (key: string) =>
    msg?.key === key ? <span className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</span> : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Services Page</h2>
        <p className="text-xs text-white/40 mt-1">Manage all services sections</p>
      </div>

      {/* Cover */}
      <form onSubmit={saveCover}>
        <SectionCard title="Cover Section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="grid grid-cols-2 gap-3 items-start">
              <Field label="Title">
                <input value={cover.title} onChange={(e) => setCover((c) => ({ ...c, title: e.target.value }))} className={inputCls} placeholder="SERVICES" />
              </Field>
              <Field label="Subtitle">
                <textarea value={cover.sub} onChange={(e) => setCover((c) => ({ ...c, sub: e.target.value }))} className={`${inputCls} resize-none`} rows={2} placeholder="What we offer…" />
              </Field>
            </div>
            <MediaInput value={cover.imageMeta} onChange={(v) => setCover((c) => ({ ...c, imageMeta: v }))} label="Cover Media" accept="any" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving === 'cover'} className="px-6 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50">{saving === 'cover' ? 'Saving…' : 'Save'}</button>
            {msgFor('cover')}
          </div>
        </SectionCard>
      </form>

      {/* Inner page */}
      <form onSubmit={saveInner}>
        <SectionCard title="Inner Page Section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 items-start">
                <Field label="Title">
                  <input value={inner.title} onChange={(e) => setInner((i) => ({ ...i, title: e.target.value }))} className={inputCls} placeholder="OUR SERVICES" />
                </Field>
                <Field label="Subtitle">
                  <textarea value={inner.sub} onChange={(e) => setInner((i) => ({ ...i, sub: e.target.value }))} className={`${inputCls} resize-none`} rows={2} placeholder="We specialise in…" />
                </Field>
              </div>
              <Field label="Details">
                <textarea value={inner.details} onChange={(e) => setInner((i) => ({ ...i, details: e.target.value }))} className={`${inputCls} h-28 resize-none`} />
              </Field>
            </div>
            <MediaInput value={inner.imageMeta} onChange={(v) => setInner((i) => ({ ...i, imageMeta: v }))} label="Inner Media" accept="any" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={saving === 'inner'} className="px-6 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50">{saving === 'inner' ? 'Saving…' : 'Save'}</button>
            {msgFor('inner')}
          </div>
        </SectionCard>
      </form>

      {/* Services list */}
      <div className="bg-dark-2 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-3">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2">Services List</h3>
          <div className="flex items-center gap-2">
            {msgFor('order-service')}
            {isDirtySvc && (
              <button onClick={() => saveOrder('service', services)} disabled={saving === 'order-service'}
                className="px-4 py-1.5 bg-dark-3 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/10 transition-colors disabled:opacity-50">
                {saving === 'order-service' ? 'Saving…' : 'Save Order'}
              </button>
            )}
            <button onClick={() => setEditingService({})}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add
            </button>
          </div>
        </div>
        {services.length === 0 ? (
          <p className="text-xs text-white/30 font-oswald tracking-wider text-center py-8">No services yet</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSvc}>
            <SortableContext items={services.map((s) => s.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {services.map((svc) => (
                    <SortableServiceCard key={svc.id} svc={svc}
                      onEdit={() => setEditingService(svc)}
                      onDelete={() => setDeleteTarget({ id: svc.id, type: 'service', name: svc.name })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Clients */}
      <div className="bg-dark-2 rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-3">
          <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2">Client Hub</h3>
          <div className="flex items-center gap-2">
            {msgFor('order-client')}
            {isDirtyClient && (
              <button onClick={() => saveOrder('client', clients)} disabled={saving === 'order-client'}
                className="px-4 py-1.5 bg-dark-3 border border-yellow-2 text-yellow-2 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/10 transition-colors disabled:opacity-50">
                {saving === 'order-client' ? 'Saving…' : 'Save Order'}
              </button>
            )}
            <button onClick={() => setEditingClient({})}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Add
            </button>
          </div>
        </div>
        {clients.length === 0 ? (
          <p className="text-xs text-white/30 font-oswald tracking-wider text-center py-8">No clients yet</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndClient}>
            <SortableContext items={clients.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                  {clients.map((cl) => (
                    <SortableClientCard key={cl.id} cl={cl}
                      onEdit={() => setEditingClient(cl)}
                      onDelete={() => setDeleteTarget({ id: cl.id, type: 'client', name: cl.name })}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AnimatePresence>
        {editingService !== null && (
          <ItemModal<ServiceItem> item={editingService} title={editingService.id ? 'Edit Service' : 'Add Service'} onSave={handleSaveService} onClose={() => setEditingService(null)} />
        )}
        {editingClient !== null && (
          <ItemModal<ClientItem> item={editingClient} title={editingClient.id ? 'Edit Client' : 'Add Client'} onSave={handleSaveClient} onClose={() => setEditingClient(null)} showDetails={false} />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={deleteTarget !== null}
        title={`Delete ${deleteTarget?.type === 'service' ? 'Service' : 'Client'}`}
        message={`Remove "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  )
}
