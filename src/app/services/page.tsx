import { prisma } from '@/lib/prisma'
import ServicesCoverSection from '@/components/services/ServicesCover'
import OurWork from '@/components/services/OurWork'
import ServiceList from '@/components/services/ServiceList'
import ClientHub from '@/components/services/ClientHub'
import Footer from '@/components/shared/Footer'
import type { ServicesCover, ServicesInner, ServiceItem, ClientItem, MediaMeta } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ServicesPage() {
  const [rawCover, rawInner, rawItems, rawClients] = await Promise.all([
    prisma.servicesCover.findUnique({ where: { id: 'singleton' } }),
    prisma.servicesInner.findUnique({ where: { id: 'singleton' } }),
    prisma.serviceItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.clientItem.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: ServicesCover | null = rawCover
    ? { title: rawCover.title, sub: rawCover.sub, imageMeta: rawCover.imageMeta as MediaMeta | null }
    : null

  const inner: ServicesInner | null = rawInner
    ? {
        title: rawInner.title,
        sub: rawInner.sub,
        imageMeta: rawInner.imageMeta as MediaMeta | null,
        details: rawInner.details,
      }
    : null

  const items: ServiceItem[] = rawItems.map((i: typeof rawItems[number]) => ({
    id: i.id,
    name: i.name,
    details: i.details,
    imageMeta: i.imageMeta as MediaMeta | null,
    displayOrder: i.displayOrder,
  }))

  const clients: ClientItem[] = rawClients.map((c: typeof rawClients[number]) => ({
    id: c.id,
    name: c.name,
    imageMeta: c.imageMeta as MediaMeta | null,
    displayOrder: c.displayOrder,
  }))

  return (
    <div>
      <ServicesCoverSection data={cover} />
      <OurWork data={inner} />
      <ServiceList items={items} />
      <ClientHub clients={clients} />
      <Footer />
    </div>
  )
}
