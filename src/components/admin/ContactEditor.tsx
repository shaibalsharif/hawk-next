'use client'
import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import type { ContactCover, ContactItem, SocialLink, ContactType } from '@/types'

interface Props {
  initialCover: ContactCover | null
  initialItems: ContactItem[]
  initialSocial: SocialLink[]
}

const inputCls = "w-full bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2"

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-dark-2 rounded-lg p-6 space-y-5 h-full">
      <h3 className="text-sm font-oswald tracking-widest uppercase text-yellow-2 border-b border-white/10 pb-3">{title}</h3>
      {children}
    </div>
  )
}

const TYPE_ICONS: Record<ContactType, string> = {
  EMAIL: '✉',
  PHONE: '☎',
  ADDRESS: '⌖',
}

export default function ContactEditor({ initialCover, initialItems, initialSocial }: Props) {
  const [cover, setCover] = useState<ContactCover>(initialCover ?? { title: '', sub: '' })
  const [items, setItems] = useState<ContactItem[]>(initialItems)
  const [social, setSocial] = useState<SocialLink[]>(initialSocial)
  const [saving, setSaving] = useState<string | null>(null)
  const [msg, setMsg] = useState<{ key: string; text: string; ok: boolean } | null>(null)

  const [newContact, setNewContact] = useState<{ type: ContactType; value: string }>({ type: 'EMAIL', value: '' })
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' })
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'contact' | 'social'; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const flash = (key: string, text: string, ok = true) => {
    setMsg({ key, text, ok }); setTimeout(() => setMsg(null), 3000)
  }

  const saveCover = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving('cover')
    try {
      await fetch('/api/content/contact', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'cover', data: cover }),
      })
      flash('cover', 'Saved!')
    } catch { flash('cover', 'Error', false) }
    setSaving(null)
  }

  const addContactItem = async () => {
    if (!newContact.value.trim()) return
    const res = await fetch('/api/content/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'contact', data: newContact }),
    })
    const created = await res.json()
    setItems((i) => [...i, created])
    setNewContact({ type: 'EMAIL', value: '' })
  }

  const addSocialLink = async () => {
    if (!newSocial.platform.trim() || !newSocial.url.trim()) return
    const res = await fetch('/api/content/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: 'social', data: newSocial }),
    })
    const created = await res.json()
    setSocial((s) => [...s, created])
    setNewSocial({ platform: '', url: '' })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.type === 'contact') {
      await fetch('/api/content/contact', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'contact', id: deleteTarget.id }),
      })
      setItems((i) => i.filter((x) => x.id !== deleteTarget.id))
    } else {
      await fetch('/api/content/contact', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: 'social', id: deleteTarget.id }),
      })
      setSocial((s) => s.filter((x) => x.id !== deleteTarget.id))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  const msgFor = (key: string) =>
    msg?.key === key ? <span className={`text-xs font-oswald tracking-wider ${msg.ok ? 'text-green-400' : 'text-red-400'}`}>{msg.text}</span> : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">Contact Page</h2>
        <p className="text-xs text-white/40 mt-1">Manage cover text, contact details, and social links</p>
      </div>

      {/* Row 1: Cover + Contact Details side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Cover */}
        <form onSubmit={saveCover}>
          <SectionCard title="Cover Section">
            <div>
              <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Title</label>
              <input value={cover.title} onChange={(e) => setCover((c) => ({ ...c, title: e.target.value }))} className={inputCls} placeholder="GET IN TOUCH" />
            </div>
            <div>
              <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Subtitle</label>
              <input value={cover.sub} onChange={(e) => setCover((c) => ({ ...c, sub: e.target.value }))} className={inputCls} placeholder="Let's create something extraordinary" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={saving === 'cover'} className="xen-btn text-white">{saving === 'cover' ? 'Saving…' : 'Save'}</button>
              {msgFor('cover')}
            </div>
          </SectionCard>
        </form>

        {/* Contact Details */}
        <SectionCard title="Contact Details">
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-xs text-white/30 font-oswald tracking-wider text-center py-4">No contact details yet</p>
            )}
            {items.map((item) => (
              <div key={item.id} className="bg-dark-3 rounded p-3 flex items-center gap-3">
                <span className="text-yellow-2 text-lg w-6 text-center flex-shrink-0">{TYPE_ICONS[item.type]}</span>
                <span className="text-xs text-white/50 font-oswald tracking-wider uppercase w-16 flex-shrink-0">{item.type}</span>
                <span className="flex-1 text-sm text-white truncate">{item.value}</span>
                <button onClick={() => setDeleteTarget({ id: item.id, type: 'contact', label: `${item.type}: ${item.value}` })} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <select
              value={newContact.type}
              onChange={(e) => setNewContact((c) => ({ ...c, type: e.target.value as ContactType }))}
              className="bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-2 flex-shrink-0"
            >
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="ADDRESS">Address</option>
            </select>
            <input
              value={newContact.value}
              onChange={(e) => setNewContact((c) => ({ ...c, value: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addContactItem()}
              placeholder="Enter value…"
              className="flex-1 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2 min-w-0"
            />
            <button onClick={addContactItem} className="px-4 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors flex-shrink-0">Add</button>
          </div>
        </SectionCard>
      </div>

      {/* Row 2: Social Links — full width */}
      <SectionCard title="Social Links">
        <div className="space-y-2">
          {social.length === 0 && (
            <p className="text-xs text-white/30 font-oswald tracking-wider text-center py-4">No social links yet</p>
          )}
          {social.map((link) => (
            <div key={link.id} className="bg-dark-3 rounded p-3 flex items-center gap-3">
              <span className="text-sm font-oswald text-yellow-2 w-28 truncate flex-shrink-0">{link.platform}</span>
              <span className="flex-1 text-xs text-white/50 truncate">{link.url}</span>
              <button onClick={() => setDeleteTarget({ id: link.id, type: 'social', label: `${link.platform}: ${link.url}` })} className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-1">
          <input value={newSocial.platform} onChange={(e) => setNewSocial((s) => ({ ...s, platform: e.target.value }))} placeholder="Platform (e.g. Instagram)" className="w-44 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2 flex-shrink-0" />
          <input value={newSocial.url} onChange={(e) => setNewSocial((s) => ({ ...s, url: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addSocialLink()} placeholder="https://…" className="flex-1 bg-dark-3 border border-white/20 rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-yellow-2 min-w-0" />
          <button onClick={addSocialLink} className="px-4 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors flex-shrink-0">Add</button>
        </div>
      </SectionCard>

      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget?.type === 'contact' ? 'Delete Contact' : 'Delete Social Link'}
        message={`Remove "${deleteTarget?.label}"? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  )
}
