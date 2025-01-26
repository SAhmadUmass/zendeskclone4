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
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/employee-login')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin-dashboard')
  const isSupportRoute = request.nextUrl.pathname.startsWith('/support-dashboard')
  const isCustomerRoute = request.nextUrl.pathname.startsWith('/customer-dashboard')
  const isProtectedRoute = isAdminRoute || isSupportRoute || isCustomerRoute

  console.log('🔒 [Middleware] Route check:', { 
    isAuthRoute, 
    isProtectedRoute,
    path: request.nextUrl.pathname,
    needsRedirect: !user && isProtectedRoute
  })

  // If not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    console.log('🔒 [Middleware] Redirecting unauthenticated user to login')
    const redirectUrl = new URL('/employee-login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access protected routes, check roles
  if (user && isProtectedRoute) {
    // Fetch user's role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('🔒 [Middleware] User role check:', {
      userId: user.id,
      role: profile?.role,
      error: profileError?.message,
      isAdminRoute,
      isSupportRoute,
      isCustomerRoute
    })

    if (profileError) {
      console.error('🔒 [Middleware] Error fetching user role:', profileError)
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    const userRole = profile?.role

    // Role-based access control with logging
    if (isAdminRoute && userRole !== 'admin') {
      console.log('🔒 [Middleware] Unauthorized admin access attempt:', {
        userRole,
        requiredRole: 'admin'
      })
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (isSupportRoute && !['admin', 'support'].includes(userRole || '')) {
      console.log('🔒 [Middleware] Unauthorized support access attempt:', {
        userRole,
        allowedRoles: ['admin', 'support']
      })
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    if (isCustomerRoute && userRole !== 'customer') {
      console.log('🔒 [Middleware] Unauthorized customer access attempt:', {
        userRole,
        requiredRole: 'customer'
      })
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // If user is authenticated but on auth routes, redirect to appropriate dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('🔒 [Middleware] Auth route redirect check:', {
      userRole: profile?.role,
      isAuthRoute
    })

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin-dashboard', request.url))
    } else if (profile?.role === 'support') {
      return NextResponse.redirect(new URL('/support-dashboard', request.url))
    } else if (profile?.role === 'customer') {
      return NextResponse.redirect(new URL('/customer-dashboard', request.url))
    }
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