import { prisma } from '@/lib/prisma'
import ContactEditor from '@/components/admin/ContactEditor'
import type { ContactCover, ContactItem, SocialLink, ContactType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminContactPage() {
  const [rawCover, rawItems, rawSocial] = await Promise.all([
    prisma.contactCover.findUnique({ where: { id: 'singleton' } }),
    prisma.contactItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: ContactCover | null = rawCover ?? null

  const items: ContactItem[] = rawItems.map((i: typeof rawItems[number]) => ({
    ...i,
    type: i.type as ContactType,
  }))

  const social: SocialLink[] = rawSocial.map((s: typeof rawSocial[number]) => ({ ...s }))

  return <ContactEditor initialCover={cover} initialItems={items} initialSocial={social} />
}
