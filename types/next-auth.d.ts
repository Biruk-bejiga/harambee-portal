import { RoleName, UserStatus } from '@prisma/client'
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      status: UserStatus
      roles: RoleName[]
      permissions: string[]
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    status: UserStatus
    roles: RoleName[]
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    firstName?: string
    lastName?: string
    status?: UserStatus
    roles?: RoleName[]
    permissions?: string[]
    roleSyncedAt?: number
  }
}
