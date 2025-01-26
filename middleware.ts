import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('🔒 [Middleware] Starting...', {
    path: request.nextUrl.pathname,
    cookies: request.cookies.getAll().map(c => c.name)
  })

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  console.log('🔒 [Middleware] Creating Supabase client...')
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  console.log('🔒 [Middleware] Getting session...')
  const {
    data: { user },
  } = await supabase.auth.getUser()
  console.log('🔒 [Middleware] Session result:', { 
    hasSession: !!user,
    userId: user?.id
  })

  // Handle authentication for protected routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/admin-dashboard') ||
                          request.nextUrl.pathname.startsWith('/support-dashboard') ||
                          request.nextUrl.pathname.startsWith('/customer-dashboard')

  console.log('🔒 [Middleware] Route check:', { 
    isAuthRoute, 
    isProtectedRoute,
    needsRedirect: !user && isProtectedRoute
  })

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

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
  async set(name: string, value: string, options: any) {
    // Implementation
  }

  async get(name: string) {
    return null
  }

  async remove(name: string, options: any) {
    // Implementation
  }
} 