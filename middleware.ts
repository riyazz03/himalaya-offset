import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = (request as any).nextauth?.token

    if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true
    }
  }
)

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/profile/:path*', '/orders/:path*']
}