import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  const [cover, inner, members] = await Promise.all([
    prisma.aboutCover.findUnique({ where: { id: 'singleton' } }),
    prisma.aboutInner.findUnique({ where: { id: 'singleton' } }),
    prisma.teamMember.findMany({ orderBy: { displayOrder: 'asc' } }),
  ])
  return NextResponse.json({ cover, inner, members })
}

export async function PUT(req: NextRequest) {
  await requireAdmin()
  const body = await req.json()
  const { section, data } = body

  if (section === 'cover') {
    const updated = await prisma.aboutCover.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })
    return NextResponse.json(updated)
  }

  if (section === 'inner') {
    const updated = await prisma.aboutInner.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data },
      update: data,
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
}

// Add team member
export async function POST(req: NextRequest) {
  await requireAdmin()
  const body = await req.json()
  const count = await prisma.teamMember.count()
  const member = await prisma.teamMember.create({
    data: { ...body, displayOrder: body.displayOrder ?? count },
  })
  return NextResponse.json(member, { status: 201 })
}
