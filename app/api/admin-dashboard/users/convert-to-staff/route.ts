import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('1. Starting auth process...')
    
    const cookieStore = await cookies()
    let response = NextResponse.next()
    
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
              console.error('Cookie setting error:', error)
            }
          },
        },
      }
    )
    
    console.log('2. Getting user session...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('3. User session result:', { 
      hasUser: !!user, 
      userId: user?.id,
      error: userError ? { message: userError.message, status: userError.status } : null 
    })

    if (userError) {
      console.error('4. Auth error:', userError)
      return NextResponse.json(
        { error: 'Authentication error', details: userError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('4. No user found in session')
      return NextResponse.json(
        { error: 'Authentication error', details: 'No user found in session' },
        { status: 401 }
      )
    }

    // Create an admin client with Service Role Key for privileged operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('5. Checking admin role...')
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()
    
    console.log('6. Profile check result:', {
      hasProfile: !!profile,
      role: profile?.role,
      error: profileError ? profileError.message : null
    })

    if (profileError) {
      console.error('7. Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Error fetching user profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      console.error('8. No profile found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found', details: 'User profile does not exist' },
        { status: 404 }
      )
    }

    if (profile.role !== 'admin') {
      console.error('8. Not admin. User role:', profile.role)
      return NextResponse.json(
        { 
          error: 'Forbidden - Admin access required',
          details: `User has role '${profile.role}' but needs 'admin'`
        },
        { status: 403 }
      )
    }

    // Get email from request body
    const { email } = await request.json()
    console.log('9. Processing email:', email)
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Prevent admin from modifying their own role
    if (email.toLowerCase() === profile.email?.toLowerCase()) {
      return NextResponse.json(
        { error: 'Cannot modify your own role' },
        { status: 400 }
      )
    }

    console.log('10. Updating user role...')
    // Use admin client for the update operation
    const { data, error: updateError } = await adminClient
      .from('profiles')
      .update({ role: 'support' })
      .eq('email', email.toLowerCase())
      .select()

    console.log('11. Update result:', {
      success: !!data && data.length > 0,
      error: updateError ? updateError.message : null
    })

    if (updateError) throw updateError

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'User not found', details: 'No user found with the provided email' },
        { status: 404 }
      )
    }

    console.log('12. Successfully updated user role')
    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error('13. Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 
