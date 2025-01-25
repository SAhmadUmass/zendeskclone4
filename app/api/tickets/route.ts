import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'
import { Ticket, TicketCreate, validateTicketCreate } from './types'

export interface RouteSegment {
  searchParams: { [key: string]: string | string[] | undefined }
}

// GET /api/tickets - List tickets
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  { searchParams }: RouteSegment
): Promise<Response> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get tickets (RLS will automatically filter based on user role)
    const { data: tickets, error } = await supabase
      .from('requests')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        customer_id,
        agent_id,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: tickets as Ticket[] })
  } catch (error: unknown) {
    const message = error instanceof PostgrestError ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// POST /api/tickets - Create ticket
export async function POST(
  request: NextRequest,
  { searchParams }: RouteSegment
): Promise<Response> {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get and validate request body
    const body = await request.json()
    const validation = validateTicketCreate(body)
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const ticketData: TicketCreate & { customer_id: string; status: 'open' } = {
      ...body,
      customer_id: session.user.id,
      status: 'open'
    }
    
    // Create ticket
    const { data: ticket, error } = await supabase
      .from('requests')
      .insert([ticketData])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { data: ticket as Ticket, message: 'Ticket created successfully' },
      { status: 201 }
    )
  } catch (error: unknown) {
    const message = error instanceof PostgrestError ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
} 