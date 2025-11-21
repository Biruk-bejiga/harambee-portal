import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in | Harambee Portal'
}

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth()

  if (session?.user) {
    const requested = searchParams?.callbackUrl
    const isSafeRelativePath = requested && requested.startsWith('/') && !requested.startsWith('//')
    redirect(isSafeRelativePath ? requested : '/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in to access your Harambee portal dashboard.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
