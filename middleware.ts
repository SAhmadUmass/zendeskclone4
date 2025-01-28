import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  console.log('🔒 [Middleware] Starting...', {
    path: request.nextUrl.pathname,
  })

  // Create a response early to handle cookie setting
  const cookieStore = await cookies()
  let response = NextResponse.next({
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
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
              })
            })
          } catch (error) {
            console.error('🔒 [Middleware] Error setting cookies:', error)
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
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
    response = NextResponse.redirect(redirectUrl)
    return response
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
      response = NextResponse.redirect(new URL('/unauthorized', request.url))
      return response
    }

    const userRole = profile?.role

    // Role-based access control with logging
    if (isAdminRoute && userRole !== 'admin') {
      console.log('🔒 [Middleware] Unauthorized admin access attempt:', {
        userRole,
        requiredRole: 'admin'
      })
      response = NextResponse.redirect(new URL('/unauthorized', request.url))
      return response
    }

    if (isSupportRoute && !['admin', 'support'].includes(userRole || '')) {
      console.log('🔒 [Middleware] Unauthorized support access attempt:', {
        userRole,
        allowedRoles: ['admin', 'support']
      })
      response = NextResponse.redirect(new URL('/unauthorized', request.url))
      return response
    }

    if (isCustomerRoute && userRole !== 'customer') {
      console.log('🔒 [Middleware] Unauthorized customer access attempt:', {
        userRole,
        requiredRole: 'customer'
      })
      response = NextResponse.redirect(new URL('/unauthorized', request.url))
      return response
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

    let redirectUrl: URL | null = null
    if (profile?.role === 'admin') {
      redirectUrl = new URL('/admin-dashboard', request.url)
    } else if (profile?.role === 'support') {
      redirectUrl = new URL('/support-dashboard', request.url)
    } else if (profile?.role === 'customer') {
      redirectUrl = new URL('/customer-dashboard', request.url)
    }

    if (redirectUrl) {
      response = NextResponse.redirect(redirectUrl)
      return response
    }
  }

  return response
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

// Updated Edge Storage Adapter that only uses getAll/setAll
export class EdgeStorageAdapter {
  private cookieStore: Map<string, { value: string, options?: any }> = new Map()

  getAll() {
    return Array.from(this.cookieStore.entries()).map(([name, { value, options }]) => ({
      name,
      value,
      options
    }))
  }

  setAll(cookiesToSet: Array<{ name: string, value: string, options?: any }>) {
    cookiesToSet.forEach(({ name, value, options }) => {
      this.cookieStore.set(name, { value, options })
    })
  }
} 