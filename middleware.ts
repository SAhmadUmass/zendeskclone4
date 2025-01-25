import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set both in the response and the request
          response.cookies.set({
            name,
            value,
            ...options,
          })
          req.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Try to refresh the session
  const { data: { session }, error } = await supabase.auth.getSession()

  // Add auth headers to the response
  if (session) {
    response.headers.set('x-supabase-auth', session.access_token)
  }

  // Handle authentication for protected routes
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/support-dashboard') || 
                          req.nextUrl.pathname.startsWith('/customer-dashboard') ||
                          req.nextUrl.pathname.startsWith('/admin-dashboard')

  if (!session && isProtectedRoute) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAuthRoute) {
    // If user is signed in and tries to access auth routes, redirect them
    const redirectUrl = new URL('/customer-dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

// Mock cookies for Edge runtime
export class EdgeStorageAdapter {
  async set(name: string, value: string, options: CookieOptions) {
    // Implementation
  }

  async get(name: string) {
    return null
  }

  async remove(name: string, options: CookieOptions) {
    // Implementation
  }
} 