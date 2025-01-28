import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
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

    console.log('1. Getting user session...')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('2. User session result:', {
      hasUser: !!user,
      userId: user?.id,
      error: userError ? { message: userError.message } : null
    })

    if (userError) {
      console.error('3. Auth error:', userError)
      return NextResponse.json(
        { error: 'Authentication error', details: userError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.error('3. No user found in session')
      return NextResponse.json(
        { error: 'Authentication error', details: 'No user found in session' },
        { status: 401 }
      )
    }

    // Create admin client
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('4. Checking admin role...')
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('5. Profile check result:', {
      hasProfile: !!profile,
      role: profile?.role,
      error: profileError ? profileError.message : null
    })

    if (profileError) {
      console.error('6. Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Error fetching user profile', details: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      console.error('6. No profile found for user:', user.id)
      return NextResponse.json(
        { error: 'Profile not found', details: 'User profile does not exist' },
        { status: 404 }
      )
    }

    if (profile.role !== 'admin') {
      console.error('6. Not admin. User role:', profile.role)
      return NextResponse.json(
        { 
          error: 'Forbidden - Admin access required',
          details: `User has role '${profile.role}' but needs 'admin'`
        },
        { status: 403 }
      )
    }

    const { ticketId, staffId } = await request.json()

    if (!ticketId || !staffId) {
      return NextResponse.json(
        { error: 'Bad Request', details: 'Both ticketId and staffId are required' },
        { status: 400 }
      )
    }

    // Verify the staff member exists and is a support staff
    const { data: staffProfile, error: staffError } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', staffId)
      .single()

    if (staffError || !staffProfile) {
      return NextResponse.json(
        { error: 'Staff member not found', details: staffError?.message || 'Invalid staffId' },
        { status: 404 }
      )
    }

    if (!['admin', 'support'].includes(staffProfile.role)) {
      return NextResponse.json(
        { error: 'Invalid assignment', details: 'Can only assign tickets to admin or support staff' },
        { status: 400 }
      )
    }

    // Update ticket assignment
    const { data, error: updateError } = await adminClient
      .from('requests')
      .update({ assigned_to: staffId })
      .eq('id', ticketId)
      .select(`
        id,
        title,
        status,
        priority,
        assigned_to,
        profiles:assigned_to (
          full_name,
          role
        )
      `)
      .single()

    if (updateError) {
      console.error('7. Update error:', updateError)
      throw updateError
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Ticket not found', details: 'No ticket found with the provided ID' },
        { status: 404 }
      )
    }

    console.log('8. Successfully assigned ticket')
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/admin-dashboard/tickets/assign:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 