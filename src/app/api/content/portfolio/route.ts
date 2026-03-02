import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const categories = await prisma.portfolioCategory.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      items: {
        orderBy: { displayOrder: 'asc' },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      },
    },
  })
  return NextResponse.json(categories)
}

// Create category or item
export async function POST(req: NextRequest) {
  await requireAdmin()
  const { type, data } = await req.json()

  if (type === 'category') {
    const count = await prisma.portfolioCategory.count()
    const cat = await prisma.portfolioCategory.create({
      data: {
        name: String(data.name ?? ''),
        details: data.details ? String(data.details) : '',
        imageMeta: data.imageMeta ?? undefined,
        displayOrder: count,
      },
    })
    return NextResponse.json(cat, { status: 201 })
  }

  if (type === 'item') {
    const categoryId = String(data.categoryId ?? '')
    const count = await prisma.portfolioItem.count({ where: { categoryId } })
    const item = await prisma.portfolioItem.create({
      data: {
        categoryId,
        title: String(data.title ?? ''),
        client: data.client ? String(data.client) : '',
        year: data.year ? Number(data.year) : new Date().getFullYear(),
        role: data.role ? String(data.role) : '',
        description: data.description ? String(data.description) : '',
        takeaways: Array.isArray(data.takeaways) ? data.takeaways.map(String) : [],
        coverMeta: data.coverMeta ?? undefined,
        displayOrder: count,
      },
      include: { images: true },
    })
    return NextResponse.json(item, { status: 201 })
  }

  if (type === 'image') {
    const itemId = String(data.itemId ?? '')
    const count = await prisma.portfolioImage.count({ where: { itemId } })
    const img = await prisma.portfolioImage.create({
      data: {
        itemId,
        imageMeta: data.imageMeta,
        displayOrder: count,
      },
    })
    return NextResponse.json(img, { status: 201 })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

// Bulk reorder categories or items
export async function PATCH(req: NextRequest) {
  await requireAdmin()
  const { type, order } = await req.json() as { type: string; order: { id: string; displayOrder: number }[] }

  if (type === 'category') {
    await Promise.all(order.map(({ id, displayOrder }) =>
      prisma.portfolioCategory.update({ where: { id }, data: { displayOrder } })
    ))
    return NextResponse.json({ ok: true })
  }

  if (type === 'item') {
    await Promise.all(order.map(({ id, displayOrder }) =>
      prisma.portfolioItem.update({ where: { id }, data: { displayOrder } })
    ))
    return NextResponse.json({ ok: true })
  }

  if (type === 'image') {
    await Promise.all(order.map(({ id, displayOrder }) =>
      prisma.portfolioImage.update({ where: { id }, data: { displayOrder } })
    ))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
