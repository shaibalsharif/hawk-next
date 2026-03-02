'use client'
import { useState, useEffect, useCallback } from 'react'
import ConfirmModal from './ConfirmModal'

type Source = 'all' | 'uploadthing' | 'gdrive' | 'youtube' | 'url'
type LoadStatus = 'unchecked' | 'ok' | 'broken'
type ViewMode = 'list' | 'grid' | 'gallery'
type SortBy = 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc'

interface Usage {
  entityType: string
  entityId: string
  label: string
}

interface FileEntry {
  id: string
  source: 'uploadthing' | 'gdrive' | 'youtube' | 'url'
  url: string
  key?: string
  name: string
  mimeType?: string
  sizeBytes?: number
  uploadedAt?: string
  usages: Usage[]
  isUnused: boolean
  canDelete: boolean
  loadStatus?: LoadStatus
}

interface ApiResponse {
  entries: FileEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  counts: Record<Source, number>
  unusedCount: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const SOURCE_LABELS: Record<string, string> = {
  uploadthing: 'UploadThing',
  gdrive: 'Google Drive',
  youtube: 'YouTube',
  url: 'Direct URL',
}

const SOURCE_COLORS: Record<string, string> = {
  uploadthing: 'bg-blue-500/20 text-blue-300',
  gdrive: 'bg-green-500/20 text-green-300',
  youtube: 'bg-red-500/20 text-red-300',
  url: 'bg-purple-500/20 text-purple-300',
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?|$)/i.test(url)
}

function isVideoEntry(entry: FileEntry): boolean {
  if (entry.mimeType?.startsWith('video/')) return true
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(entry.url)
}

function thumbnailUrl(entry: FileEntry): string | null {
  if (entry.source === 'youtube') return `https://img.youtube.com/vi/${entry.url}/mqdefault.jpg`
  if (entry.source === 'uploadthing' || entry.source === 'url') {
    if (isVideoEntry(entry)) return null
    if (entry.mimeType?.startsWith('image/') || isImageUrl(entry.url)) return entry.url
  }
  return null
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({ entry, onClose }: { entry: FileEntry; onClose: () => void }) {
  const isYouTube = entry.source === 'youtube'
  const isGDrive = entry.source === 'gdrive'
  const isVideo = isVideoEntry(entry)
  const looksLikeImage = !isVideo && (entry.mimeType?.startsWith('image/') || isImageUrl(entry.url))

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative bg-dark-2 rounded-lg overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <p className="text-sm font-oswald tracking-wide text-white truncate pr-4" title={entry.name}>{entry.name}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-dark-3/50 min-h-[200px]">
          {isYouTube ? (
            <div className="w-full aspect-video">
              <iframe src={`https://www.youtube.com/embed/${entry.url}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          ) : isGDrive ? (
            <div className="p-6 text-center space-y-4">
              <svg className="w-12 h-12 text-green-400/50 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
              <p className="text-white/50 text-sm font-oswald tracking-wider">Google Drive file</p>
              <p className="text-white/30 text-xs break-all max-w-xs mx-auto">{entry.url}</p>
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-oswald tracking-wider uppercase rounded transition-colors">
                Open in Drive
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
            </div>
          ) : isVideo ? (
            <video
              src={entry.url}
              controls
              playsInline
              className="max-w-full max-h-[60vh] bg-black"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : looksLikeImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.url} alt={entry.name} className="max-w-full max-h-[60vh] object-contain p-2" />
          ) : (
            <div className="p-6 text-center space-y-4">
              <svg className="w-12 h-12 text-white/20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <p className="text-white/30 text-xs break-all max-w-sm mx-auto">{entry.url}</p>
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-oswald tracking-wider uppercase rounded transition-colors">
                Open File
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
            </div>
          )}
        </div>
        <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-oswald tracking-wider uppercase px-2 py-0.5 rounded-full ${SOURCE_COLORS[entry.source]}`}>{SOURCE_LABELS[entry.source]}</span>
            {entry.sizeBytes !== undefined && <span className="text-xs text-white/30">{formatBytes(entry.sizeBytes)}</span>}
          </div>
          {!isGDrive && !isYouTube && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1.5">
              Open original
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Thumbnail helper ──────────────────────────────────────────────────────────

function ThumbIcon({ entry, className }: { entry: FileEntry; className?: string }) {
  if (entry.source === 'gdrive') {
    return (
      <div className={`bg-green-500/10 flex items-center justify-center ${className}`}>
        <svg className="w-1/3 h-1/3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
      </div>
    )
  }
  if (isVideoEntry(entry)) {
    return (
      <div className={`bg-dark-3 flex items-center justify-center ${className}`}>
        <svg className="w-1/3 h-1/3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
    )
  }
  const src = thumbnailUrl(entry)
  if (!src) {
    return (
      <div className={`bg-white/5 flex items-center justify-center ${className}`}>
        <svg className="w-1/3 h-1/3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`object-cover bg-dark-3 ${className}`} />
  )
}

// ── View toggle icons ─────────────────────────────────────────────────────────

function ListIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  )
}
function GalleryIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function FileManagerClient() {
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [counts, setCounts] = useState<Record<Source, number>>({ all: 0, uploadthing: 0, gdrive: 0, youtube: 0, url: 0 })
  const [unusedCount, setUnusedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [source, setSource] = useState<Source>('all')
  const [onlyUnused, setOnlyUnused] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('date_desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previewEntry, setPreviewEntry] = useState<FileEntry | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        page: String(page), pageSize: String(pageSize),
        source, onlyUnused: String(onlyUnused), sortBy,
      })
      const r = await fetch(`/api/media/files?${params}`)
      if (!r.ok) throw new Error('Failed to load')
      const data: ApiResponse = await r.json()
      setEntries(data.entries.map((f) => ({ ...f, loadStatus: 'unchecked' as LoadStatus })))
      setTotal(data.total)
      setTotalPages(data.totalPages)
      setCounts(data.counts)
      setUnusedCount(data.unusedCount)
    } catch {
      setError('Failed to load files.')
    }
    setLoading(false)
  }, [page, pageSize, source, onlyUnused, sortBy])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const markBroken = (id: string) =>
    setEntries((prev) => prev.map((f) => (f.id === id ? { ...f, loadStatus: 'broken' } : f)))

  const brokenCount = entries.filter((f) => f.loadStatus === 'broken').length
  const handleSourceChange = (s: Source) => { setSource(s); setPage(1) }
  const handlePageSizeChange = (size: number) => { setPageSize(size); setPage(1) }
  const handleUnusedToggle = () => { setOnlyUnused((v) => !v); setPage(1) }
  const handleSortChange = (s: SortBy) => { setSortBy(s); setPage(1) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await fetch('/api/media/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey: deleteTarget.key }),
      })
      await fetchFiles()
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const sourceTabs: { key: Source; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'uploadthing', label: 'UploadThing' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'gdrive', label: 'Google Drive' },
    { key: 'url', label: 'Direct URL' },
  ]

  const viewToggle: { key: ViewMode; icon: React.ReactNode; label: string }[] = [
    { key: 'list', icon: <ListIcon />, label: 'List' },
    { key: 'grid', icon: <GridIcon />, label: 'Grid' },
    { key: 'gallery', icon: <GalleryIcon />, label: 'Gallery' },
  ]

  // ── Render entries by view mode ────────────────────────────────────────────

  const renderList = () => (
    <div className="bg-dark-2 rounded-lg overflow-hidden border border-white/5">
      {entries.map((entry, idx) => (
        <div key={entry.id} className={`flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.02] ${idx < entries.length - 1 ? 'border-b border-white/5' : ''}`}>
          <ThumbIcon entry={entry} className="w-14 h-14 rounded flex-shrink-0" />

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-oswald text-white tracking-wide truncate max-w-xs" title={entry.name}>{entry.name}</p>
              {entry.loadStatus === 'broken' && (
                <span className="text-[10px] font-oswald tracking-wider uppercase bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full flex-shrink-0">Broken</span>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[10px] font-oswald tracking-wider uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${SOURCE_COLORS[entry.source]}`}>{SOURCE_LABELS[entry.source]}</span>
              {entry.sizeBytes !== undefined && <span className="text-xs text-white/30">{formatBytes(entry.sizeBytes)}</span>}
              {entry.uploadedAt && <span className="text-xs text-white/20">{new Date(entry.uploadedAt).toLocaleDateString()}</span>}
              {entry.isUnused
                ? <span className="text-[10px] font-oswald tracking-wider uppercase bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded-full flex-shrink-0">Unused</span>
                : <span className="text-[10px] font-oswald tracking-wider uppercase bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0">Active</span>
              }
            </div>
            {entry.usages.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.usages.slice(0, 3).map((u, i) => (
                  <span key={i} className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">{u.label}</span>
                ))}
                {entry.usages.length > 3 && <span className="text-[10px] text-white/20">+{entry.usages.length - 3} more</span>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setPreviewEntry(entry)} className="p-1.5 text-white/30 hover:text-white transition-colors" title="Preview">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            {entry.canDelete && (
              <button onClick={() => setDeleteTarget(entry)} className="p-1.5 text-white/30 hover:text-red-400 transition-colors" title="Delete">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {entries.map((entry) => (
        <div key={entry.id} className="bg-dark-2 rounded-lg overflow-hidden flex flex-col group">
          <button onClick={() => setPreviewEntry(entry)} className="w-full aspect-video relative overflow-hidden flex-shrink-0">
            <ThumbIcon entry={entry} className="w-full h-full" />
            {entry.isUnused && (
              <span className="absolute top-2 left-2 text-[10px] font-oswald tracking-wider uppercase bg-amber-400/80 text-dark-1 px-1.5 py-0.5 rounded">Unused</span>
            )}
            {entry.loadStatus === 'broken' && (
              <span className="absolute top-2 left-2 text-[10px] font-oswald tracking-wider uppercase bg-red-500/80 text-white px-1.5 py-0.5 rounded">Broken</span>
            )}
          </button>
          <div className="p-3 flex-1 flex flex-col gap-2">
            <p className="text-xs font-oswald text-white tracking-wide truncate" title={entry.name}>{entry.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-oswald tracking-wider uppercase px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[entry.source]}`}>{SOURCE_LABELS[entry.source]}</span>
              {entry.sizeBytes !== undefined && <span className="text-[10px] text-white/30">{formatBytes(entry.sizeBytes)}</span>}
            </div>
          </div>
          <div className="flex border-t border-white/5">
            <button onClick={() => setPreviewEntry(entry)} className="flex-1 py-2 text-[10px] font-oswald tracking-wider uppercase text-white/40 hover:text-yellow-2 hover:bg-yellow-2/5 transition-colors border-r border-white/5">
              Preview
            </button>
            {entry.canDelete ? (
              <button onClick={() => setDeleteTarget(entry)} className="flex-1 py-2 text-[10px] font-oswald tracking-wider uppercase text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors">
                Delete
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderGallery = () => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {entries.map((entry) => (
        <div key={entry.id} className="relative group aspect-square rounded overflow-hidden bg-dark-2 cursor-pointer" onClick={() => setPreviewEntry(entry)}>
          <ThumbIcon entry={entry} className="w-full h-full" />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
            <p className="text-[10px] font-oswald text-white text-center leading-tight line-clamp-2 px-1">{entry.name}</p>
            <span className={`text-[9px] font-oswald tracking-wider uppercase px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[entry.source]}`}>{SOURCE_LABELS[entry.source]}</span>
          </div>

          {/* Status badges (always visible) */}
          {entry.isUnused && (
            <span className="absolute top-1 left-1 text-[9px] font-oswald uppercase bg-amber-400/80 text-dark-1 px-1 py-0.5 rounded leading-none">U</span>
          )}
          {entry.loadStatus === 'broken' && (
            <span className="absolute top-1 left-1 text-[9px] font-oswald uppercase bg-red-500/80 text-white px-1 py-0.5 rounded leading-none">!</span>
          )}

          {/* Delete button on hover */}
          {entry.canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteTarget(entry) }}
              className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )

  const renderSkeleton = () => {
    if (viewMode === 'list') {
      return (
        <div className="bg-dark-2 rounded-lg overflow-hidden border border-white/5">
          {[...Array(Math.min(pageSize, 8))].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-white/5 animate-pulse">
              <div className="w-14 h-14 bg-white/10 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 w-20 bg-white/10 rounded-full" />
                <div className="h-8 w-8 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      )
    }
    if (viewMode === 'gallery') {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {[...Array(18)].map((_, i) => (
            <div key={i} className="aspect-square rounded bg-white/10 animate-pulse" />
          ))}
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-dark-2 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-video bg-white/10" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-oswald tracking-wider uppercase text-yellow-2">File Manager</h2>
          <p className="text-xs text-white/40 mt-1">All media files and references — identify unused, broken, or orphaned files</p>
        </div>
        {!loading && (
          <div className="flex gap-3 flex-wrap">
            {unusedCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-oswald tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />{unusedCount} unused
              </span>
            )}
            {brokenCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-oswald tracking-wider text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />{brokenCount} broken
              </span>
            )}
          </div>
        )}
      </div>

      {/* Source filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {sourceTabs.map((tab) => (
          <button key={tab.key} onClick={() => handleSourceChange(tab.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-oswald tracking-wider uppercase transition-colors ${
              source === tab.key ? 'bg-yellow-2 text-dark-1' : 'bg-dark-2 text-white/50 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
            {!loading && <span className={`ml-1.5 ${source === tab.key ? 'text-dark-1/60' : 'text-white/30'}`}>{counts[tab.key]}</span>}
          </button>
        ))}
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Unused toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={handleUnusedToggle} className={`w-9 h-5 rounded-full relative transition-colors ${onlyUnused ? 'bg-yellow-2' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-dark-1 transition-all ${onlyUnused ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-oswald tracking-wider text-white/50 uppercase">Unused only</span>
          </label>

          {/* View mode toggle */}
          <div className="flex gap-1 bg-dark-2 p-1 rounded border border-white/10">
            {viewToggle.map((v) => (
              <button key={v.key} onClick={() => setViewMode(v.key)} title={v.label}
                className={`p-1.5 rounded transition-colors ${viewMode === v.key ? 'bg-yellow-2 text-dark-1' : 'text-white/40 hover:text-white'}`}
              >
                {v.icon}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            className="bg-dark-2 border border-white/10 text-white/60 text-xs font-oswald tracking-wider uppercase rounded px-3 py-1.5 focus:outline-none focus:border-yellow-2/50 cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="date_desc">Date: Newest</option>
            <option value="date_asc">Date: Oldest</option>
            <option value="name_asc">Name: A → Z</option>
            <option value="name_desc">Name: Z → A</option>
            <option value="size_desc">Size: Largest</option>
            <option value="size_asc">Size: Smallest</option>
          </select>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 font-oswald tracking-wider">Per page:</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((s) => (
              <button key={s} onClick={() => handlePageSizeChange(s)}
                className={`px-2.5 py-1 rounded text-xs font-oswald tracking-wider transition-colors ${
                  pageSize === s ? 'bg-yellow-2 text-dark-1' : 'bg-dark-2 text-white/40 hover:text-white border border-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File display */}
      {loading ? renderSkeleton() : error ? (
        <div className="bg-dark-2 rounded-lg py-16 text-center text-red-400 text-sm font-oswald tracking-wider">{error}</div>
      ) : entries.length === 0 ? (
        <div className="bg-dark-2 rounded-lg py-16 text-center">
          <svg className="w-10 h-10 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
          <p className="text-white/30 font-oswald tracking-widest uppercase text-sm">No files found</p>
        </div>
      ) : viewMode === 'list' ? renderList() : viewMode === 'grid' ? renderGrid() : renderGallery()}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-white/30 font-oswald tracking-wider">
            {total === 0 ? 'No files' : `Showing ${rangeStart}–${rangeEnd} of ${total} ${total === 1 ? 'file' : 'files'}`}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1
                if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                  if (p === page - 3 || p === page + 3) return <span key={p} className="text-white/20 px-1">…</span>
                  return null
                }
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded text-xs font-oswald tracking-wider transition-colors ${page === p ? 'bg-yellow-2 text-dark-1' : 'text-white/40 hover:text-white'}`}
                  >{p}</button>
                )
              })}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 text-white/40 hover:text-white disabled:opacity-30 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && (source === 'gdrive' || source === 'youtube' || source === 'url') && (
        <div className="bg-dark-2/50 border border-white/10 rounded-lg p-4">
          <p className="text-xs text-white/40 font-oswald tracking-wider">
            <span className="text-yellow-2/80">Note:</span>{' '}
            {SOURCE_LABELS[source]} files are referenced by URL — they cannot be deleted from here.
          </p>
        </div>
      )}

      {previewEntry && <PreviewModal entry={previewEntry} onClose={() => setPreviewEntry(null)} />}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete File"
        message={deleteTarget?.isUnused
          ? `Permanently delete "${deleteTarget?.name}"? This file is not used by any content.`
          : `Permanently delete "${deleteTarget?.name}"? It is currently used by ${deleteTarget?.usages.length} content item(s). This cannot be undone.`}
        confirmLabel="Delete Permanently"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
        danger
      />
    </div>
  )
}
