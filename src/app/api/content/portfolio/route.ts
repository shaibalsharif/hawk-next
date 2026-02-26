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
      data: { ...data, displayOrder: data.displayOrder ?? count },
    })
    return NextResponse.json(cat, { status: 201 })
  }

  if (type === 'item') {
    const count = await prisma.portfolioItem.count({ where: { categoryId: data.categoryId } })
    const item = await prisma.portfolioItem.create({
      data: {
        ...data,
        displayOrder: data.displayOrder ?? count,
        takeaways: data.takeaways ?? [],
      },
      include: { images: true },
    })
    return NextResponse.json(item, { status: 201 })
  }

  if (type === 'image') {
    const count = await prisma.portfolioImage.count({ where: { itemId: data.itemId } })
    const img = await prisma.portfolioImage.create({
      data: { ...data, displayOrder: data.displayOrder ?? count },
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

  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}
