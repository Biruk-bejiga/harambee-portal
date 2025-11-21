import { EnrollmentStatus } from '@prisma/client'
import { NextResponse } from 'next/server'

import { getActiveStudent } from '@/lib/active-user'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { sectionId } = await req.json()

  if (!sectionId || typeof sectionId !== 'string') {
    return NextResponse.json({ error: 'sectionId is required' }, { status: 400 })
  }

  const user = await getActiveStudent()
  if (!user) {
    return NextResponse.json({ error: 'No student available' }, { status: 404 })
  }

  const section = await prisma.section.findUnique({ where: { id: sectionId } })
  if (!section) {
    return NextResponse.json({ error: 'Section not found' }, { status: 404 })
  }

  const existing = await prisma.enrollment.findFirst({
    where: { studentId: user.id, sectionId }
  })

  if (existing) {
    return NextResponse.json({ message: 'Already enrolled', enrollmentId: existing.id })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: user.id,
      sectionId,
      status: EnrollmentStatus.APPROVED
    }
  })

  return NextResponse.json({
    enrollmentId: enrollment.id,
    status: enrollment.status
  })
}
