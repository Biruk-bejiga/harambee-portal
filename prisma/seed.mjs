import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Seed a student user
  const user = await prisma.user.upsert({
    where: { email: 'student@example.edu' },
    update: {},
    create: {
      email: 'student@example.edu',
      password: '$2b$10$4m8O3k9t8RClB2d1pRjHfO9Z1j6JqY0x0x0x0x0x0x0x0x0x0x0', // placeholder hash
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Kim',
          major: 'Computer Science',
          year: 2,
          phone: '555-0100'
        }
      }
    }
  })

  // Seed some courses
  const courses = await prisma.$transaction([
    prisma.course.upsert({
      where: { code: 'CS101' },
      update: {},
      create: { code: 'CS101', title: 'Intro to CS', credits: 3, fee: 1200, description: 'Fundamentals of programming' }
    }),
    prisma.course.upsert({
      where: { code: 'MATH201' },
      update: {},
      create: { code: 'MATH201', title: 'Calculus II', credits: 4, fee: 1400, description: 'Integral calculus and series' }
    }),
    prisma.course.upsert({
      where: { code: 'ENG150' },
      update: {},
      create: { code: 'ENG150', title: 'Academic Writing', credits: 2, fee: 800, description: 'Composition and rhetoric' }
    })
  ])

  // Enroll user into two courses
  await prisma.enrollment.createMany({
    data: [
      { userId: user.id, courseId: courses[0].id },
      { userId: user.id, courseId: courses[1].id },
    ],
    skipDuplicates: true
  })

  // Seed grades
  await prisma.grade.createMany({
    data: [
      { userId: user.id, courseId: courses[0].id, score: 92.5, letter: 'A' },
      { userId: user.id, courseId: courses[1].id, score: 84.0, letter: 'B' },
    ],
    skipDuplicates: true
  })

  // Seed invoices
  const term = 'Fall 2025'
  const amountDue = courses.slice(0,2).reduce((sum, c) => sum + c.fee, 0)
  await prisma.invoice.upsert({
    where: { id: `${user.id}-${term}` },
    update: {},
    create: {
      id: `${user.id}-${term}`,
      userId: user.id,
      term,
      amountDue,
      amountPaid: 500,
      dueDate: new Date(Date.now() + 1000*60*60*24*30),
      status: 'PENDING'
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
