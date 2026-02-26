import { prisma } from '@/lib/prisma'
import ContactCover from '@/components/contact/ContactCover'
import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm from '@/components/contact/ContactForm'
import Footer from '@/components/shared/Footer'
import type { ContactCover as ContactCoverType, ContactItem, SocialLink, ContactType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const [rawCover, rawItems, rawSocial] = await Promise.all([
    prisma.contactCover.findUnique({ where: { id: 'singleton' } }),
    prisma.contactItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])

  const cover: ContactCoverType | null = rawCover
    ? { title: rawCover.title, sub: rawCover.sub }
    : null

  const items: ContactItem[] = rawItems.map((i: typeof rawItems[number]) => ({
    id: i.id,
    type: i.type as ContactType,
    value: i.value,
    displayOrder: i.displayOrder,
  }))

  const social: SocialLink[] = rawSocial.map((s: typeof rawSocial[number]) => ({
    id: s.id,
    platform: s.platform,
    url: s.url,
    displayOrder: s.displayOrder,
  }))

  return (
    <div>
      <ContactCover data={cover} />
      <ContactDetails items={items} social={social} />
      <ContactForm />
      <Footer />
    </div>
  )
}
