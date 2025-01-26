import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    console.log('1. Starting auth process...')
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies()
            return cookieStore.get(name)?.value
          },
          async set(name: string, value: string, options: any) {
            const cookieStore = await cookies()
            cookieStore.set(name, value, options)
          },
          async remove(name: string, options: any) {
            const cookieStore = await cookies()
            cookieStore.set(name, '', { ...options, maxAge: 0 })
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

    if (userError || !user) {
      console.error('4. Auth error:', userError || 'No user found')
      return NextResponse.json(
        { error: 'Authentication error', details: userError?.message || 'No user found' },
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
      .select('role')
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

    if (!profile || profile.role !== 'admin') {
      console.error('8. Not admin. User role:', profile?.role)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
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
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('12. Successfully updated user role')
    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error('13. Fatal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
