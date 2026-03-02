'use client'
import { useState } from 'react'
import MediaInput from '../MediaInput'
import { inputCls } from './shared'
import type { PortfolioCategory, MediaMeta } from '@/types'

interface Props {
  cat: Partial<PortfolioCategory>
  onSave: (data: Partial<PortfolioCategory>) => void
  onClose: () => void
}

export default function CategoryModal({ cat, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    name: cat.name ?? '',
    details: cat.details ?? '',
    imageMeta: cat.imageMeta ?? null as MediaMeta | null,
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/70 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4">
        <div className="bg-dark-2 rounded-lg p-6 w-full max-w-md space-y-4 my-8">
          <h3 className="text-lg font-oswald tracking-wider uppercase text-yellow-2">
            {cat.id ? 'Edit Category' : 'New Category'}
          </h3>

          <div>
            <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs text-white/50 font-oswald tracking-widest uppercase mb-1.5">Details</label>
            <textarea value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))} className={`${inputCls} h-20 resize-none`} />
          </div>

          <MediaInput value={form.imageMeta} onChange={(v) => setForm((f) => ({ ...f, imageMeta: v }))} label="Cover Image" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => onSave(form)}
              className="flex-1 py-2 bg-yellow-2 text-dark-1 text-xs font-oswald tracking-wider uppercase rounded hover:bg-yellow-2/90 transition-colors">
              Save
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border border-white/20 text-white/60 text-xs font-oswald tracking-wider uppercase rounded hover:border-white/40 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
