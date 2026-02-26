'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MediaInput from './MediaInput'
import ConfirmModal from './ConfirmModal'
import type { AboutCover, AboutInner, TeamMember, MediaMeta } from '@/types'

interface Props {
  initialCover: AboutCover | null
  initialInner: AboutInner | null
  initialMembers: TeamMember[]
}

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

const inputCls = "w-full bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"

function SaveBtn({ saving, label = 'Save' }: { saving: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={saving}
      className="px-6 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors disabled:opacity-50"
    >
      {saving ? 'Saving…' : label}
    </button>
  )
}

// ── Member modal ─────────────────────────────────────────────────────────────

function MemberModal({
  member,
  onSave,
  onClose,
}: {
  member: Partial<TeamMember>
  onSave: (data: Partial<TeamMember>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: member.name ?? '',
    position: member.position ?? '',
    imageMeta: member.imageMeta ?? null as MediaMeta | null,
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-dark-2 rounded-lg p-6 w-full max-w-2xl my-8 space-y-5">
          <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">
            {member.id ? 'Edit Member' : 'Add Member'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: text fields */}
            <div className="space-y-4">
              <Field label="Name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Position">
                <input
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className={inputCls}
                  placeholder="DOP & Content Planner"
                />
              </Field>
            </div>

            {/* Right: photo with contain preview */}
            <div>
              <MediaInput
                value={form.imageMeta}
                onChange={(v) => setForm((f) => ({ ...f, imageMeta: v }))}
                label="Photo"
                previewFit="contain"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSave(form)}
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

// ── Main editor ──────────────────────────────────────────────────────────────

export default function AboutEditor({ initialCover, initialInner, initialMembers }: Props) {
  const [cover, setCover] = useState<AboutCover>(initialCover ?? { title: '', sub: '', points: ['', '', ''], imageMeta: null })
  const [inner, setInner] = useState<AboutInner>(initialInner ?? { title: '', description: '' })
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ key: string; text: string; ok: boolean } | null>(null)
  const [editingMember, setEditingMember] = useState<Partial<TeamMember> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const flash = (key: string, text: string, ok = true) => {
    setMsg({ key, text, ok })
    setTimeout(() => setMsg(null), 3000)
  }

  const saveCover = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving('cover')
    try {
      await fetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'cover', data: cover }),
      })
      flash('cover', 'Saved!')
    } catch { flash('cover', 'Error saving', false) }
    setSaving(null)
  }

  const saveInner = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving('inner')
    try {
      await fetch('/api/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'inner', data: inner }),
      })
      flash('inner', 'Saved!')
    } catch { flash('inner', 'Error saving', false) }
    setSaving(null)
  }

  const handleSaveMember = async (data: Partial<TeamMember>) => {
    if (editingMember?.id) {
      const res = await fetch(`/api/content/about/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const updated = await res.json()
      setMembers((m) => m.map((x) => (x.id === editingMember.id ? updated : x)))
    } else {
      const res = await fetch('/api/content/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setMembers((m) => [...m, created])
    }
    setEditingMember(null)
  }

  const confirmDeleteMember = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/content/about/${deleteTarget.id}`, { method: 'DELETE' })
    setMembers((m) => m.filter((x) => x.id !== deleteTarget.id))
    setDeleting(false)
    setDeleteTarget(null)
  }

  const updatePoint = (i: number, val: string) => {
    const pts = [...(cover.points ?? ['', '', ''])]
    pts[i] = val
    setCover((c) => ({ ...c, points: pts }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">About Page</h2>
        <p className="text-xs text-white/40 mt-1">Manage the three sections of the About page</p>
      </div>

      {/* ── Cover section ─────────────────────────────────────────────── */}
      <form onSubmit={saveCover}>
        <SectionCard title="Cover Section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: text fields */}
            <div className="space-y-4">
              <Field label="Headline">
                <input
                  value={cover.title}
                  onChange={(e) => setCover((c) => ({ ...c, title: e.target.value }))}
                  className={inputCls}
                  placeholder="WHO WE ARE"
                />
              </Field>
              <Field label="Subtitle">
                <input
                  value={cover.sub}
                  onChange={(e) => setCover((c) => ({ ...c, sub: e.target.value }))}
                  className={inputCls}
                  placeholder="A Creative Studio…"
                />
              </Field>
              <div className="space-y-2">
                <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase">Key Points</label>
                {(cover.points ?? ['', '', '']).map((pt, i) => (
                  <input
                    key={i}
                    value={pt}
                    onChange={(e) => updatePoint(i, e.target.value)}
                    className={inputCls}
                    placeholder={`Point ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: cover image */}
            <div>
              <MediaInput
                value={cover.imageMeta}
                onChange={(v) => setCover((c) => ({ ...c, imageMeta: v }))}
                label="Cover Image"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <SaveBtn saving={saving === 'cover'} />
            {msg?.key === 'cover' && (
              <span className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
                {msg.text}
              </span>
            )}
          </div>
        </SectionCard>
      </form>

      {/* ── Inner page section + Team members side by side ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Inner page section */}
        <form onSubmit={saveInner}>
          <SectionCard title="Inner Page Section">
            <Field label="Title">
              <input
                value={inner.title}
                onChange={(e) => setInner((i) => ({ ...i, title: e.target.value }))}
                className={inputCls}
                placeholder="OUR STORY"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={inner.description}
                onChange={(e) => setInner((i) => ({ ...i, description: e.target.value }))}
                className={`${inputCls} h-32 resize-none`}
                placeholder="About the company…"
              />
            </Field>
            <div className="flex items-center gap-4 pt-2">
              <SaveBtn saving={saving === 'inner'} />
              {msg?.key === 'inner' && (
                <span className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>
                  {msg.text}
                </span>
              )}
            </div>
          </SectionCard>
        </form>

        {/* Team members */}
        <SectionCard title="Team Members">
        {members.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8 font-oswald tracking-wider">No members yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {members.map((m) => {
                const photoUrl = m.imageMeta && typeof m.imageMeta === 'object' && 'url' in m.imageMeta
                  ? (m.imageMeta as MediaMeta).url
                  : null

                return (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-dark-3 rounded-lg overflow-hidden flex flex-col"
                  >
                    {/* Square photo */}
                    <div className="aspect-square bg-dark-2 flex-shrink-0 overflow-hidden">
                      {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={photoUrl}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl font-oswald font-bold text-white/10">
                            {(m.name ?? '?')[0].toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="px-2 py-1.5 flex-1">
                      <p className="text-xs font-oswald tracking-wide text-white truncate">{m.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{m.position}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex border-t border-white/5">
                      <button
                        onClick={() => setEditingMember(m)}
                        className="flex-1 py-1.5 text-[10px] font-oswald tracking-wider uppercase text-white/40 hover:text-yellow-2 hover:bg-yellow-2/5 transition-colors border-r border-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="flex-1 py-1.5 text-[10px] font-oswald tracking-wider uppercase text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        <button
          onClick={() => setEditingMember({})}
          className="mt-4 px-5 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors"
        >
          + Add Member
        </button>
        </SectionCard>

      </div>{/* end inner + team grid */}

      <AnimatePresence>
        {editingMember !== null && (
          <MemberModal
            member={editingMember}
            onSave={handleSaveMember}
            onClose={() => setEditingMember(null)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Member"
        message={`Remove "${deleteTarget?.name}" from the team? This cannot be undone.`}
        onConfirm={confirmDeleteMember}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
