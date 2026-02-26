import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const slides = await prisma.homeSlide.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(slides)
}

export async function PUT(req: NextRequest) {
  await requireAdmin()
  const body = await req.json()
  // body = { slides: HomeSlide[] }
  const { slides } = body

  // Replace all slides in a transaction
  await prisma.$transaction([
    prisma.homeSlide.deleteMany(),
    prisma.homeSlide.createMany({ data: slides }),
  ])

  const updated = await prisma.homeSlide.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(updated)
}

export async function POST(req: NextRequest) {
  await requireAdmin()
  const body = await req.json()
  const count = await prisma.homeSlide.count()
  const slide = await prisma.homeSlide.create({
    data: { ...body, order: count },
  })
  return NextResponse.json(slide, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  await requireAdmin()
  const { id } = await req.json()
  await prisma.homeSlide.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
