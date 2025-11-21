import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

const PUBLIC_ROUTES = ['/login']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))
}

export default auth(async req => {
  const { nextUrl } = req
  const pathname = nextUrl.pathname
  const isLoggedIn = Boolean(req.auth)

  if (!isLoggedIn && !isPublicRoute(pathname)) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loginUrl = new URL('/login', nextUrl.origin)
    const callbackPath = `${pathname}${nextUrl.search}`

    if (callbackPath && callbackPath !== '/login') {
      loginUrl.searchParams.set('callbackUrl', callbackPath)
    }

    return NextResponse.redirect(loginUrl)
  }

  if (isLoggedIn && pathname === '/login') {
    const callbackUrl = req.nextUrl.searchParams.get('callbackUrl')
    const isSafeRelativePath = callbackUrl && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')

    return NextResponse.redirect(new URL(isSafeRelativePath ? callbackUrl : '/', nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)']
}
