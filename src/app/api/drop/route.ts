import { NextResponse } from 'next/server'

import { getActiveStudent } from '@/lib/active-user'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { enrollmentId, sectionId } = await req.json()

  const user = await getActiveStudent()
  if (!user) {
    return NextResponse.json({ error: 'No student available' }, { status: 404 })
  }

  if (!enrollmentId && !sectionId) {
    return NextResponse.json({ error: 'enrollmentId or sectionId is required' }, { status: 400 })
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: user.id,
      ...(enrollmentId ? { id: enrollmentId } : {}),
      ...(sectionId ? { sectionId } : {})
    }
  })

  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
  }

  await prisma.enrollment.delete({ where: { id: enrollment.id } })

  return NextResponse.json({ success: true })
}
