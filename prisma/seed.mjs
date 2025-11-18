import { PrismaClient, RoleName, Semester, UserStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const permissionSeeds = [
    { code: 'user.manage', label: 'Manage users and access' },
    { code: 'role.assign', label: 'Assign roles and permissions' },
    { code: 'calendar.manage', label: 'Manage academic calendar' },
    { code: 'analytics.view', label: 'View analytics dashboards' },
    { code: 'course.material.write', label: 'Manage course materials' },
    { code: 'attendance.record', label: 'Record class attendance' },
    { code: 'grade.post', label: 'Post grades' },
    { code: 'grade.approve', label: 'Approve submitted grades' },
    { code: 'department.report', label: 'Generate department reports' },
    { code: 'finance.invoice', label: 'Manage invoices' },
    { code: 'finance.payment', label: 'Process payments' },
    { code: 'student.enroll', label: 'Manage student enrollments' },
    { code: 'student.viewSelf', label: 'View own academic records' },
    { code: 'registrar.records', label: 'Manage academic records' },
    { code: 'it.ticket', label: 'Manage IT support tickets' },
    { code: 'hr.staff', label: 'Manage staff records' }
  ]

  const permissionRecords = await Promise.all(
    permissionSeeds.map(permission =>
      prisma.permission.upsert({
        where: { code: permission.code },
        update: { label: permission.label },
        create: permission
      })
    )
  )

  const permissionMap = Object.fromEntries(permissionRecords.map(permission => [permission.code, permission.id]))

  const rolePermissions = {
    [RoleName.ADMINISTRATOR]: [
      'user.manage',
      'role.assign',
      'calendar.manage',
      'analytics.view',
      'finance.invoice',
      'finance.payment',
      'grade.approve',
      'department.report'
    ],
    [RoleName.TEACHER]: ['course.material.write', 'attendance.record', 'grade.post'],
    [RoleName.DEPARTMENT_HEAD]: [
      'department.report',
      'grade.approve',
      'course.material.write',
      'attendance.record'
    ],
    [RoleName.FINANCE_OFFICER]: ['finance.invoice', 'finance.payment'],
    [RoleName.STUDENT]: ['student.enroll', 'student.viewSelf'],
    [RoleName.REGISTRAR]: ['registrar.records', 'grade.approve', 'student.enroll'],
    [RoleName.LIBRARIAN]: [],
    [RoleName.IT_SUPPORT]: ['it.ticket'],
    [RoleName.HR]: ['hr.staff']
  }

  for (const roleName of Object.keys(rolePermissions)) {
    const description = roleName.split('_').join(' ').toLowerCase()
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: { description },
      create: { name: roleName, description }
    })

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })

    const permissionsForRole = rolePermissions[roleName]
    if (permissionsForRole?.length) {
      await prisma.rolePermission.createMany({
        data: permissionsForRole.map(code => ({
          roleId: role.id,
          permissionId: permissionMap[code]
        }))
      })
    }
  }

  const adminPassword = await bcrypt.hash('Admin@1234', 12)
  const teacherPassword = await bcrypt.hash('Teacher@1234', 12)
  const studentPassword = await bcrypt.hash('Student@1234', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@harambee.edu' },
    update: {
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      status: UserStatus.ACTIVE
    },
    create: {
      email: 'admin@harambee.edu',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator'
    }
  })

  const teacherUser = await prisma.user.upsert({
    where: { email: 'professor@harambee.edu' },
    update: {
      passwordHash: teacherPassword,
      firstName: 'Liya',
      lastName: 'Bekele',
      status: UserStatus.ACTIVE
    },
    create: {
      email: 'professor@harambee.edu',
      passwordHash: teacherPassword,
      firstName: 'Liya',
      lastName: 'Bekele'
    }
  })

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@harambee.edu' },
    update: {
      passwordHash: studentPassword,
      firstName: 'Alex',
      lastName: 'Kim',
      status: UserStatus.ACTIVE
    },
    create: {
      email: 'student@harambee.edu',
      passwordHash: studentPassword,
      firstName: 'Alex',
      lastName: 'Kim'
    }
  })

  async function assignRole(userId, roleName) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } })
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id
        }
      },
      update: {},
      create: {
        userId,
        roleId: role.id
      }
    })
  }

  await assignRole(adminUser.id, RoleName.ADMINISTRATOR)
  await assignRole(teacherUser.id, RoleName.TEACHER)
  await assignRole(studentUser.id, RoleName.STUDENT)

  const department = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {
      name: 'Computer Science'
    },
    create: {
      code: 'CS',
      name: 'Computer Science',
      headId: teacherUser.id
    }
  })

  const program = await prisma.program.upsert({
    where: {
      departmentId_code: {
        departmentId: department.id,
        code: 'BSCS'
      }
    },
    update: {
      name: 'Bachelor of Science in Computer Science'
    },
    create: {
      departmentId: department.id,
      code: 'BSCS',
      name: 'Bachelor of Science in Computer Science',
      level: 'UNDERGRADUATE'
    }
  })

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {
      programId: program.id,
      admissionType: 'REGULAR',
      yearLevel: 3,
      semester: 1
    },
    create: {
      userId: studentUser.id,
      programId: program.id,
      admissionType: 'REGULAR',
      yearLevel: 3,
      semester: 1
    }
  })

  const term = await prisma.term.upsert({
    where: {
      year_semester: {
        year: 2025,
        semester: Semester.FALL
      }
    },
    update: {
      startDate: new Date('2025-09-01T00:00:00Z'),
      endDate: new Date('2025-12-20T00:00:00Z'),
      isCurrent: true
    },
    create: {
      year: 2025,
      semester: Semester.FALL,
      startDate: new Date('2025-09-01T00:00:00Z'),
      endDate: new Date('2025-12-20T00:00:00Z'),
      isCurrent: true
    }
  })

  await prisma.academicCalendar.upsert({
    where: { termId: term.id },
    update: {
      events: {
        registrationOpens: '2025-08-15',
        classesStart: '2025-09-02',
        finalsWeek: '2025-12-10'
      }
    },
    create: {
      termId: term.id,
      events: {
        registrationOpens: '2025-08-15',
        classesStart: '2025-09-02',
        finalsWeek: '2025-12-10'
      },
      published: true
    }
  })

  const course = await prisma.course.upsert({
    where: {
      departmentId_code: {
        departmentId: department.id,
        code: 'CS101'
      }
    },
    update: {
      title: 'Introduction to Computer Science',
      credits: 3,
      description: 'Foundational computing concepts and problem solving.',
      feeAmount: '1200.00'
    },
    create: {
      departmentId: department.id,
      programId: program.id,
      code: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 3,
      description: 'Foundational computing concepts and problem solving.',
      feeAmount: '1200.00'
    }
  })

  const section = await prisma.section.upsert({
    where: {
      courseId_termId_sectionCode: {
        courseId: course.id,
        termId: term.id,
        sectionCode: 'A'
      }
    },
    update: {
      teacherId: teacherUser.id,
      schedule: {
        days: ['Mon', 'Wed'],
        startTime: '09:00',
        endTime: '10:15',
        location: 'Main Hall 204'
      }
    },
    create: {
      courseId: course.id,
      termId: term.id,
      sectionCode: 'A',
      teacherId: teacherUser.id,
      schedule: {
        days: ['Mon', 'Wed'],
        startTime: '09:00',
        endTime: '10:15',
        location: 'Main Hall 204'
      },
      capacity: 40
    }
  })

  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_sectionId: {
        studentId: studentUser.id,
        sectionId: section.id
      }
    },
    update: {
      status: 'APPROVED'
    },
    create: {
      studentId: studentUser.id,
      sectionId: section.id,
      status: 'APPROVED'
    }
  })

  await prisma.grade.upsert({
    where: { enrollmentId: enrollment.id },
    update: {
      status: 'APPROVED',
      score: 92.5,
      letter: 'A',
      submittedBy: teacherUser.id,
      approvedBy: adminUser.id,
      submittedAt: new Date(),
      approvedAt: new Date()
    },
    create: {
      enrollmentId: enrollment.id,
      status: 'APPROVED',
      score: 92.5,
      letter: 'A',
      submittedBy: teacherUser.id,
      approvedBy: adminUser.id,
      submittedAt: new Date(),
      approvedAt: new Date()
    }
  })

  await prisma.invoice.upsert({
    where: { number: 'INV-2025-0001' },
    update: {
      amountDue: '1200.00',
      amountPaid: '500.00',
      status: 'PENDING'
    },
    create: {
      studentId: studentUser.id,
      termId: term.id,
      number: 'INV-2025-0001',
      dueDate: new Date('2025-12-18T00:00:00Z'),
      amountDue: '1200.00',
      amountPaid: '500.00',
      status: 'PENDING',
      issuedBy: adminUser.id
    }
  })

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: 'Welcome to Harambee Portal',
      body: 'Explore your dashboard to manage courses, billing, and academic updates.'
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async error => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
