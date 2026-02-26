import { prisma } from '@/lib/prisma'
import ServicesEditor from '@/components/admin/ServicesEditor'
import type { ServicesCover, ServicesInner, ServiceItem, ClientItem, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminServicesPage() {
  const [rawCover, rawInner, rawServices, rawClients] = await Promise.all([
    prisma.servicesCover.findUnique({ where: { id: 'singleton' } }),
    prisma.servicesInner.findUnique({ where: { id: 'singleton' } }),
    prisma.serviceItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.clientItem.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: ServicesCover | null = rawCover
    ? { ...rawCover, imageMeta: rawCover.imageMeta as unknown as MediaMeta | null }
    : null

  const inner: ServicesInner | null = rawInner
    ? { ...rawInner, imageMeta: rawInner.imageMeta as unknown as MediaMeta | null }
    : null

  const services: ServiceItem[] = rawServices.map((s: typeof rawServices[number]) => ({
    ...s,
    imageMeta: s.imageMeta as unknown as MediaMeta | null,
  }))

  const clients: ClientItem[] = rawClients.map((c: typeof rawClients[number]) => ({
    ...c,
    imageMeta: c.imageMeta as unknown as MediaMeta | null,
  }))

  return (
    <ServicesEditor
      initialCover={cover}
      initialInner={inner}
      initialServices={services}
      initialClients={clients}
    />
  )
}
