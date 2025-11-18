import { PrismaAdapter } from '@auth/prisma-adapter'
import { RoleName, UserStatus } from '@prisma/client'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'

type AuthContextPayload = {
  id: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
  roles: RoleName[]
  permissions: string[]
}

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long')
})

async function fetchUserAuthContextById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user) return null

  return mapUserToAuthPayload(user)
}

function mapUserToAuthPayload(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  status: UserStatus
  roles: Array<{
    role: {
      name: RoleName
      permissions: Array<{
        permission: {
          code: string
        }
      }>
    }
  }>
})
  : AuthContextPayload {
  const roles = user.roles.map(({ role }) => role.name)
  const permissions = new Set<string>()

  user.roles.forEach(({ role }) => {
    role.permissions.forEach(({ permission }) => {
      permissions.add(permission.code)
    })
  })

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    roles,
    permissions: Array.from(permissions)
  }
}

async function fetchUserForCredentials(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          }
        }
      }
    }
  })

  if (!user) return null

  return user
}

export const {
  handlers: authHandlers,
  auth,
  signIn,
  signOut
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async credentials => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const { email, password } = parsed.data
        const user = await fetchUserForCredentials(email)
        if (!user) return null

        if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.ARCHIVED) {
          return null
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash)
        if (!isValidPassword) return null

        return mapUserToAuthPayload(user)
      }
    })
  ],
  callbacks: {
    signIn: async ({ user }) => {
      if (!user) return false
      const status = (user as AuthContextPayload).status
      return status === UserStatus.ACTIVE || status === UserStatus.INVITED
    },
    jwt: async ({ token, user }) => {
      const needsSync = typeof token.roleSyncedAt !== 'number' || Date.now() - token.roleSyncedAt > 5 * 60 * 1000

      if (user) {
        const payload = user as AuthContextPayload
        token.sub = payload.id
        token.email = payload.email
        token.firstName = payload.firstName
        token.lastName = payload.lastName
        token.status = payload.status
        token.roles = payload.roles
        token.permissions = payload.permissions
        token.roleSyncedAt = Date.now()
        return token
      }

      if (token.sub && needsSync) {
        const refreshed = await fetchUserAuthContextById(token.sub)
        if (refreshed) {
          token.email = refreshed.email
          token.firstName = refreshed.firstName
          token.lastName = refreshed.lastName
          token.status = refreshed.status
          token.roles = refreshed.roles
          token.permissions = refreshed.permissions
          token.roleSyncedAt = Date.now()
        }
      }

      return token
    },
    session: async ({ session, token }) => {
      if (!session.user || !token.sub) {
        return session
      }

      session.user = {
        id: token.sub,
        email: (token.email as string) ?? '',
        firstName: (token.firstName as string) ?? '',
        lastName: (token.lastName as string) ?? '',
        status: token.status as UserStatus,
        roles: (token.roles as RoleName[]) ?? [],
        permissions: (token.permissions as string[]) ?? []
      }

      return session
    }
  },
  events: {
    updateUser: async ({ user }) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      })
    }
  }
})

export type AuthUser = DefaultSession['user'] & {
  id: string
  firstName: string
  lastName: string
  status: UserStatus
  roles: RoleName[]
  permissions: string[]
}
