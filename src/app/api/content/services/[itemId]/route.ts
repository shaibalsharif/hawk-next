import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  await requireAdmin()
  const { itemId } = await params
  const { section, data } = await req.json()

  if (section === 'service') {
    const item = await prisma.serviceItem.update({ where: { id: itemId }, data })
    return NextResponse.json(item)
  }
  if (section === 'client') {
    const item = await prisma.clientItem.update({ where: { id: itemId }, data })
    return NextResponse.json(item)
  }
  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  await requireAdmin()
  const { itemId } = await params
  const url = new URL(req.url)
  const section = url.searchParams.get('section')

  if (section === 'service') {
    await prisma.serviceItem.delete({ where: { id: itemId } })
  } else if (section === 'client') {
    await prisma.clientItem.delete({ where: { id: itemId } })
  }
  return NextResponse.json({ ok: true })
}
