import { NextResponse } from 'next/server'

import { getActiveStudent } from '@/lib/active-user'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const user = await getActiveStudent()
  if (!user) {
    return NextResponse.json({ error: 'No student available' }, { status: 404 })
  }

  const url = new URL(request.url)
  const year = url.searchParams.get('year')
  const semester = url.searchParams.get('semester')

  const grades = await prisma.grade.findMany({
    where: {
      enrollment: {
        studentId: user.id,
        section: {
          term: {
            ...(year ? { year: Number(year) } : {}),
            ...(semester ? { semester: semester as any } : {})
          }
        }
      }
    },
    include: {
      enrollment: {
        include: {
          section: {
            include: {
              course: true,
              term: true
            }
          }
        }
      }
    },
    orderBy: [{ approvedAt: 'desc' }, { submittedAt: 'desc' }]
  })

  return NextResponse.json({
    grades: grades.map((grade) => ({
      id: grade.id,
      score: grade.score,
      letter: grade.letter,
      status: grade.status,
      submittedAt: grade.submittedAt,
      approvedAt: grade.approvedAt,
      course: {
        code: grade.enrollment.section.course.code,
        title: grade.enrollment.section.course.title,
        credits: grade.enrollment.section.course.credits
      },
      term: {
        year: grade.enrollment.section.term.year,
        semester: grade.enrollment.section.term.semester
      }
    }))
  })
}
