'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

type FormState = {
  isSubmitting: boolean
  error: string | null
}

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<FormState>({ isSubmitting: false, error: null })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString().trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
      setState({ isSubmitting: false, error: 'Email and password are required.' })
      return
    }

    setState({ isSubmitting: true, error: null })

    try {
      const callbackUrl = searchParams.get('callbackUrl') ?? '/'
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })

      if (!result || result.error) {
        setState({ isSubmitting: false, error: 'Invalid email or password.' })
        return
      }

      setState({ isSubmitting: false, error: null })
      router.push(result.url ?? callbackUrl)
      router.refresh()
    } catch (error) {
      console.error('Failed to sign in', error)
      setState({ isSubmitting: false, error: 'Something went wrong. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={state.isSubmitting}
        className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
      >
        {state.isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
