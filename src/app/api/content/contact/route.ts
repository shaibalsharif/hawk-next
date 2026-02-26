import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const [cover, items, social] = await Promise.all([
    prisma.contactCover.findUnique({ where: { id: 'singleton' } }),
    prisma.contactItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])
  return NextResponse.json({ cover, items, social })
}

export async function PUT(req: NextRequest) {
  await requireAdmin()
  const { section, data } = await req.json()

  if (section === 'cover') {
    const updated = await prisma.contactCover.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })
    return NextResponse.json(updated)
  }
  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  await requireAdmin()
  const { section, data } = await req.json()

  if (section === 'contact') {
    const count = await prisma.contactItem.count()
    const item = await prisma.contactItem.create({
      data: { ...data, displayOrder: data.displayOrder ?? count },
    })
    return NextResponse.json(item, { status: 201 })
  }
  if (section === 'social') {
    const count = await prisma.socialLink.count()
    const link = await prisma.socialLink.create({
      data: { ...data, displayOrder: data.displayOrder ?? count },
    })
    return NextResponse.json(link, { status: 201 })
  }
  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  await requireAdmin()
  const { section, id } = await req.json()

  if (section === 'contact') await prisma.contactItem.delete({ where: { id } })
  else if (section === 'social') await prisma.socialLink.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
