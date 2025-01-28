import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'

export type AuthError = {
  status: number
  message: string
}

export type AuthenticatedHandler<T> = (
  request: NextRequest,
  supabase: Awaited<ReturnType<typeof createClient>>,
  params?: T
) => Promise<Response>

export async function withAuth<T = undefined>(
  handler: AuthenticatedHandler<T>,
  request: NextRequest,
  params?: T
): Promise<Response> {
  try {
    const supabase = await createClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      )
    }

    return await handler(request, supabase, params)
  } catch (error) {
    console.error('Server error:', error)
    
    if (error instanceof PostgrestError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 
