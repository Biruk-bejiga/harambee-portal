import { RoleName } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function getActiveUser() {
  const session = await auth()

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        roles: { include: { role: true } },
        profile: true,
        staffProfile: true
      }
    })

    if (user) return user
  }

  return prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: {
            name: RoleName.STUDENT
          }
        }
      }
    },
    include: {
      roles: { include: { role: true } },
      profile: true,
      staffProfile: true
    }
  })
}

export async function getActiveStudent() {
  const user = await getActiveUser()
  if (!user) return null

  const hasStudentRole = user.roles.some((assignment) => assignment.role.name === RoleName.STUDENT)
  if (hasStudentRole) {
    return user
  }

  const fallback = await prisma.user.findFirst({
    where: {
      roles: {
        some: {
          role: {
            name: RoleName.STUDENT
          }
        }
      }
    },
    include: {
      roles: { include: { role: true } },
      profile: true,
      staffProfile: true
    }
  })

  return fallback
}
