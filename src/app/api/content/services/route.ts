import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const [cover, inner, services, clients] = await Promise.all([
    prisma.servicesCover.findUnique({ where: { id: 'singleton' } }),
    prisma.servicesInner.findUnique({ where: { id: 'singleton' } }),
    prisma.serviceItem.findMany({ orderBy: { displayOrder: 'asc' } }),
    prisma.clientItem.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])
  return NextResponse.json({ cover, inner, services, clients })
}

export async function PUT(req: NextRequest) {
  await requireAdmin()
  const { section, data } = await req.json()

  if (section === 'cover') {
    const updated = await prisma.servicesCover.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })
    return NextResponse.json(updated)
  }
  if (section === 'inner') {
    const updated = await prisma.servicesInner.upsert({
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

  if (section === 'service') {
    const count = await prisma.serviceItem.count()
    const item = await prisma.serviceItem.create({
      data: { ...data, displayOrder: data.displayOrder ?? count },
    })
    return NextResponse.json(item, { status: 201 })
  }
  if (section === 'client') {
    const count = await prisma.clientItem.count()
    const item = await prisma.clientItem.create({
      data: { ...data, displayOrder: data.displayOrder ?? count },
    })
    return NextResponse.json(item, { status: 201 })
  }

  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}

// Bulk reorder service items or clients
export async function PATCH(req: NextRequest) {
  await requireAdmin()
  const { section, order } = await req.json() as { section: string; order: { id: string; displayOrder: number }[] }

  if (section === 'service') {
    await Promise.all(order.map(({ id, displayOrder }) =>
      prisma.serviceItem.update({ where: { id }, data: { displayOrder } })
    ))
    return NextResponse.json({ ok: true })
  }

  if (section === 'client') {
    await Promise.all(order.map(({ id, displayOrder }) =>
      prisma.clientItem.update({ where: { id }, data: { displayOrder } })
    ))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}
