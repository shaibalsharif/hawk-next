import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { UTApi } from 'uploadthing/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const utapi = new UTApi()

const VALID_PAGE_SIZES = [10, 25, 50, 100]
const VALID_SORT = ['date_desc', 'date_asc', 'name_asc', 'name_desc', 'size_asc', 'size_desc'] as const
type SortBy = typeof VALID_SORT[number]

interface Usage {
  entityType: string
  entityId: string
  label: string
}

interface RawMeta {
  type: string
  url: string
  key?: string
}

interface FileEntry {
  id: string
  source: 'uploadthing' | 'gdrive' | 'youtube' | 'url'
  url: string
  key?: string
  name: string
  sizeBytes?: number
  uploadedAt?: string
  usages: Usage[]
  isUnused: boolean
  canDelete: boolean
}

function metaLookupKey(meta: RawMeta): string {
  if (meta.type === 'uploadthing' && meta.key) return `ut:${meta.key}`
  return `${meta.type}:${meta.url}`
}

function nameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(url.split('?')[0])
    const parts = decoded.split('/')
    return parts[parts.length - 1] || url
  } catch {
    return url
  }
}

export async function GET(req: NextRequest) {
  await requireAdmin()

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const rawSize = parseInt(searchParams.get('pageSize') ?? '10')
  const pageSize = VALID_PAGE_SIZES.includes(rawSize) ? rawSize : 10
  const sourceFilter = searchParams.get('source') ?? 'all'
  const onlyUnused = searchParams.get('onlyUnused') === 'true'
  const rawSort = searchParams.get('sortBy') ?? 'date_desc'
  const sortBy: SortBy = (VALID_SORT as readonly string[]).includes(rawSort) ? rawSort as SortBy : 'date_desc'

  // Map: lookupKey → { meta, usages[] }
  const contentMap = new Map<string, { meta: RawMeta; usages: Usage[] }>()

  const addUsage = (meta: RawMeta, entityType: string, entityId: string, label: string) => {
    const key = metaLookupKey(meta)
    if (!contentMap.has(key)) contentMap.set(key, { meta, usages: [] })
    contentMap.get(key)!.usages.push({ entityType, entityId, label })
  }

  // ── Scan all content ──────────────────────────────────────
  const [
    aboutCover, members, servicesCover, servicesInner,
    serviceItems, clientItems, categories, portfolioItems,
    portfolioImages, homeSlides,
  ] = await Promise.all([
    prisma.aboutCover.findFirst(),
    prisma.teamMember.findMany(),
    prisma.servicesCover.findFirst(),
    prisma.servicesInner.findFirst(),
    prisma.serviceItem.findMany(),
    prisma.clientItem.findMany(),
    prisma.portfolioCategory.findMany(),
    prisma.portfolioItem.findMany(),
    prisma.portfolioImage.findMany(),
    prisma.homeSlide.findMany(),
  ])

  if (aboutCover?.imageMeta)
    addUsage(aboutCover.imageMeta as unknown as RawMeta, 'AboutCover', aboutCover.id, 'About — Cover Image')
  for (const m of members)
    if (m.imageMeta)
      addUsage(m.imageMeta as unknown as RawMeta, 'TeamMember', m.id, `Team — ${m.name}`)
  if (servicesCover?.imageMeta)
    addUsage(servicesCover.imageMeta as unknown as RawMeta, 'ServicesCover', servicesCover.id, 'Services — Cover')
  if (servicesInner?.imageMeta)
    addUsage(servicesInner.imageMeta as unknown as RawMeta, 'ServicesInner', servicesInner.id, 'Services — Inner')
  for (const s of serviceItems)
    if (s.imageMeta)
      addUsage(s.imageMeta as unknown as RawMeta, 'ServiceItem', s.id, `Service — ${s.name}`)
  for (const c of clientItems)
    if (c.imageMeta)
      addUsage(c.imageMeta as unknown as RawMeta, 'ClientItem', c.id, `Client — ${c.name}`)
  for (const cat of categories)
    if (cat.imageMeta)
      addUsage(cat.imageMeta as unknown as RawMeta, 'PortfolioCategory', cat.id, `Portfolio Category — ${cat.name}`)
  for (const item of portfolioItems)
    if (item.coverMeta)
      addUsage(item.coverMeta as unknown as RawMeta, 'PortfolioItem', item.id, `Portfolio Cover — ${item.title}`)
  for (const img of portfolioImages)
    addUsage(img.imageMeta as unknown as RawMeta, 'PortfolioImage', img.id, 'Portfolio Gallery Image')

  for (const slide of homeSlides) {
    const syntheticKey = `youtube:${slide.videoId}`
    if (!contentMap.has(syntheticKey))
      contentMap.set(syntheticKey, { meta: { type: 'youtube', url: slide.videoId }, usages: [] })
    contentMap.get(syntheticKey)!.usages.push({ entityType: 'HomeSlide', entityId: slide.id, label: `Home Slide — ${slide.title}` })
  }

  // ── Fetch tracked MediaFiles + ALL UploadThing files ──────
  const [mediaFiles, { files: utFiles }] = await Promise.all([
    prisma.mediaFile.findMany({ orderBy: { uploadedAt: 'desc' } }),
    utapi.listFiles(),
  ])

  const mediaFilesByKey = new Map(mediaFiles.map((f) => [f.fileKey, f]))
  const orphanUtFiles = utFiles.filter((f) => !mediaFilesByKey.has(f.key))

  const orphanUrlMap = new Map<string, string>()
  if (orphanUtFiles.length > 0) {
    const { data } = await utapi.getFileUrls(orphanUtFiles.map((f) => f.key))
    for (const item of data) orphanUrlMap.set(item.key, item.url)
  }

  // ── Build full entry list ─────────────────────────────────
  const allEntries: FileEntry[] = []
  const processedKeys = new Set<string>()

  for (const file of mediaFiles) {
    const lookupKey = `ut:${file.fileKey}`
    processedKeys.add(lookupKey)
    const usages = contentMap.get(lookupKey)?.usages ?? []
    allEntries.push({
      id: file.id,
      source: 'uploadthing',
      url: file.fileUrl,
      key: file.fileKey,
      name: nameFromUrl(file.fileUrl),
      sizeBytes: file.size ?? undefined,
      uploadedAt: file.uploadedAt.toISOString(),
      usages,
      isUnused: usages.length === 0,
      canDelete: true,
    })
  }

  for (const utFile of orphanUtFiles) {
    const lookupKey = `ut:${utFile.key}`
    if (processedKeys.has(lookupKey)) continue
    processedKeys.add(lookupKey)
    const url = orphanUrlMap.get(utFile.key) ?? ''
    const usages = contentMap.get(lookupKey)?.usages ?? []
    allEntries.push({
      id: `ut-orphan:${utFile.key}`,
      source: 'uploadthing',
      url,
      key: utFile.key,
      name: utFile.name,
      sizeBytes: utFile.size,
      uploadedAt: new Date(utFile.uploadedAt).toISOString(),
      usages,
      isUnused: usages.length === 0,
      canDelete: true,
    })
  }

  for (const [lookupKey, { meta, usages }] of contentMap) {
    if (processedKeys.has(lookupKey)) continue
    processedKeys.add(lookupKey)
    const src = meta.type as FileEntry['source']
    let name: string
    if (src === 'youtube') name = `YouTube — ${meta.url}`
    else if (src === 'gdrive') name = `Google Drive — ${nameFromUrl(meta.url)}`
    else name = nameFromUrl(meta.url)
    allEntries.push({ id: lookupKey, source: src, url: meta.url, key: meta.key, name, usages, isUnused: usages.length === 0, canDelete: src === 'uploadthing' && !!meta.key })
  }

  // ── Counts for filter tabs (always from full list) ────────
  const counts = {
    all: allEntries.length,
    uploadthing: allEntries.filter((e) => e.source === 'uploadthing').length,
    gdrive: allEntries.filter((e) => e.source === 'gdrive').length,
    youtube: allEntries.filter((e) => e.source === 'youtube').length,
    url: allEntries.filter((e) => e.source === 'url').length,
  }
  const unusedCount = allEntries.filter((e) => e.isUnused).length

  // ── Apply filters ─────────────────────────────────────────
  const filtered = allEntries.filter((e) => {
    if (sourceFilter !== 'all' && e.source !== sourceFilter) return false
    if (onlyUnused && !e.isUnused) return false
    return true
  })

  // ── Sort ──────────────────────────────────────────────────
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return (a.uploadedAt ?? '').localeCompare(b.uploadedAt ?? '')
      case 'date_desc':
        return (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? '')
      case 'name_asc':
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      case 'name_desc':
        return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' })
      case 'size_asc':
        return (a.sizeBytes ?? 0) - (b.sizeBytes ?? 0)
      case 'size_desc':
        return (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0)
    }
  })

  // ── Paginate ──────────────────────────────────────────────
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const entries = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return NextResponse.json({ entries, total, page: currentPage, pageSize, totalPages, counts, unusedCount })
}
