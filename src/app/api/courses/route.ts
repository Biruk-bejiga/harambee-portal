import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getActiveStudent } from '@/lib/active-user'

export async function GET() {
  const user = await getActiveStudent()
  if (!user) {
    return NextResponse.json({ error: 'No student available' }, { status: 404 })
  }

  const currentTerm = await prisma.term.findFirst({ where: { isCurrent: true } })

  const sections = await prisma.section.findMany({
    where: currentTerm ? { termId: currentTerm.id } : undefined,
    include: {
      course: true
    },
    orderBy: [{ course: { code: 'asc' } }, { sectionCode: 'asc' }]
  })

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: user.id },
    include: {
      section: {
        include: {
          course: true,
          term: true
        }
      }
    },
    orderBy: [{ enrolledAt: 'desc' }]
  })

  return NextResponse.json({
    catalog: sections.map((section) => ({
      sectionId: section.id,
      courseId: section.courseId,
      code: section.course.code,
      title: section.course.title,
      credits: section.course.credits,
      sectionCode: section.sectionCode,
      schedule: section.schedule
    })),
    enrollments: enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      sectionId: enrollment.sectionId,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      code: enrollment.section.course.code,
      title: enrollment.section.course.title,
      credits: enrollment.section.course.credits,
      sectionCode: enrollment.section.sectionCode,
      term: {
        year: enrollment.section.term.year,
        semester: enrollment.section.term.semester
      }
    }))
  })
}
