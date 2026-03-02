import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const { type, data } = await req.json()

  if (type === 'category') {
    const cat = await prisma.portfolioCategory.update({
      where: { id },
      data: {
        name: data.name !== undefined ? String(data.name) : undefined,
        details: data.details !== undefined ? String(data.details) : undefined,
        imageMeta: data.imageMeta !== undefined ? data.imageMeta : undefined,
      },
    })
    return NextResponse.json(cat)
  }
  if (type === 'item') {
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        title: data.title !== undefined ? String(data.title) : undefined,
        client: data.client !== undefined ? String(data.client) : undefined,
        year: data.year !== undefined ? Number(data.year) : undefined,
        role: data.role !== undefined ? String(data.role) : undefined,
        description: data.description !== undefined ? String(data.description) : undefined,
        takeaways: data.takeaways !== undefined ? (Array.isArray(data.takeaways) ? data.takeaways.map(String) : []) : undefined,
        coverMeta: data.coverMeta !== undefined ? data.coverMeta : undefined,
      },
    })
    return NextResponse.json(item)
  }
  if (type === 'image') {
    const img = await prisma.portfolioImage.update({
      where: { id },
      data: {
        hidden: data.hidden !== undefined ? Boolean(data.hidden) : undefined,
        colSpan: data.colSpan !== undefined ? Number(data.colSpan) : undefined,
        rowSpan: data.rowSpan !== undefined ? Number(data.rowSpan) : undefined,
        objectFit: data.objectFit !== undefined ? String(data.objectFit) : undefined,
        objectPosition: data.objectPosition !== undefined ? String(data.objectPosition) : undefined,
        imageMeta: data.imageMeta !== undefined ? data.imageMeta : undefined,
        thumbMeta: data.thumbMeta !== undefined ? data.thumbMeta : undefined,
      },
    })
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
