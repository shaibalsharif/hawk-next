// ── Media ───────────────────────────────────────────────────
export interface MediaMeta {
  type: 'uploadthing' | 'gdrive' | 'youtube' | 'url'
  key?: string   // UploadThing file key (used for deletion)
  url: string
}

// ── Auth ────────────────────────────────────────────────────
export interface SessionUser {
  uid: string
  email: string | undefined
  admin: boolean
  superadmin: boolean
}

// ── Home ────────────────────────────────────────────────────
export interface HomeSlide {
  id: string
  videoId: string
  title: string
  subtitle: string
  category: string
  order: number
}

// ── About ───────────────────────────────────────────────────
export interface AboutCover {
  title: string
  sub: string
  points: string[]
  imageMeta: MediaMeta | null
}

export interface AboutInner {
  title: string
  description: string
}

export interface TeamMember {
  id: string
  name: string
  position: string
  imageMeta: MediaMeta | null
  displayOrder: number
}

// ── Services ────────────────────────────────────────────────
export interface ServicesCover {
  title: string
  sub: string
  imageMeta: MediaMeta | null
}

export interface ServicesInner {
  title: string
  sub: string
  imageMeta: MediaMeta | null
  details: string
}

export interface ServiceItem {
  id: string
  name: string
  details: string
  imageMeta: MediaMeta | null
  displayOrder: number
}

export interface ClientItem {
  id: string
  name: string
  imageMeta: MediaMeta | null
  displayOrder: number
}

// ── Portfolio ───────────────────────────────────────────────
export interface PortfolioCategory {
  id: string
  name: string
  details: string
  imageMeta: MediaMeta | null
  displayOrder: number
  items?: PortfolioItem[]
}

export interface PortfolioImage {
  id: string
  itemId: string
  imageMeta: MediaMeta
  displayOrder: number
}

export interface PortfolioItem {
  id: string
  categoryId: string
  title: string
  client: string
  year: number
  role: string
  coverMeta: MediaMeta | null
  description: string
  takeaways: string[]
  displayOrder: number
  images?: PortfolioImage[]
  category?: PortfolioCategory
}

// ── Contact ─────────────────────────────────────────────────
export type ContactType = 'EMAIL' | 'PHONE' | 'ADDRESS'

export interface ContactCover {
  title: string
  sub: string
}

export interface ContactItem {
  id: string
  type: ContactType
  value: string
  displayOrder: number
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  displayOrder: number
}

// ── Media tracking ──────────────────────────────────────────
export type MediaProvider = 'UPLOADTHING' | 'GDRIVE' | 'YOUTUBE' | 'URL'

export interface MediaFile {
  id: string
  fileKey: string
  fileUrl: string
  provider: MediaProvider
  entityType: string
  entityId: string
  uploadedAt: Date
  size?: number | null
}

// ── Admin Users ─────────────────────────────────────────────
export interface AdminUser {
  uid: string
  email: string | undefined
  displayName: string | undefined
  disabled: boolean
}
