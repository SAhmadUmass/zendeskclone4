import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'
import { Ticket, TicketUpdate, validateTicketUpdate } from '../types'

export interface RouteSegment {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

// GET /api/tickets/[id] - Get single ticket
export async function GET(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  { params }: RouteSegment
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

    // Get single ticket (RLS will verify access)
    const { data: ticket, error } = await supabase
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
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data: ticket as Ticket })
  } catch (error: unknown) {
    const message = error instanceof PostgrestError ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// PUT /api/tickets/[id] - Update ticket
export async function PUT(
  request: NextRequest,
  { params }: RouteSegment
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
    const validation = validateTicketUpdate(body)
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const updateData: TicketUpdate & { updated_at: string } = {
      ...body,
      updated_at: new Date().toISOString()
    }
    
    // Update ticket
    const { data: ticket, error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      data: ticket as Ticket,
      message: 'Ticket updated successfully'
    })
  } catch (error: unknown) {
    const message = error instanceof PostgrestError ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  { params }: RouteSegment
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

    // Delete ticket
    const { error } = await supabase
      .from('requests')
      .delete()
      .eq('id', params.id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Ticket not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      message: 'Ticket deleted successfully'
    })
  } catch (error: unknown) {
    const message = error instanceof PostgrestError ? error.message : 'Internal Server Error'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
} 