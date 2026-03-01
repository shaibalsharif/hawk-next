import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { type, data } = await req.json()

  if (type === 'category') {
    const cat = await prisma.portfolioCategory.update({ where: { id }, data })
    return NextResponse.json(cat)
  }
  if (type === 'item') {
    // Strip relation fields — Prisma cannot accept them as plain update data
    const { images, category, ...itemData } = data
    void images; void category
    const item = await prisma.portfolioItem.update({ where: { id }, data: itemData })
    return NextResponse.json(item)
  }
  if (type === 'image') {
    const img = await prisma.portfolioImage.update({ where: { id }, data })
    return NextResponse.json(img)
  }
  return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const url = new URL(req.url)
  const type = url.searchParams.get('type')

  if (type === 'category') {
    await prisma.portfolioCategory.delete({ where: { id } })
  } else if (type === 'item') {
    await prisma.portfolioItem.delete({ where: { id } })
  } else if (type === 'image') {
    await prisma.portfolioImage.delete({ where: { id } })
  }
  return NextResponse.json({ ok: true })
}
