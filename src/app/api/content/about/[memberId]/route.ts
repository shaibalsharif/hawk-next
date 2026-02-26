import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  await requireAdmin()
  const { memberId } = await params
  const body = await req.json()
  const member = await prisma.teamMember.update({
    where: { id: memberId },
    data: body,
  })
  return NextResponse.json(member)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  await requireAdmin()
  const { memberId } = await params
  await prisma.teamMember.delete({ where: { id: memberId } })
  return NextResponse.json({ ok: true })
}
