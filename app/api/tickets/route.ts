import { NextResponse, type NextRequest } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'
import { Ticket, TicketCreate, validateTicketCreate } from './types'
import { withAuth } from '@/utils/auth/middleware'

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'

// GET /api/tickets - List tickets
export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(async (_request, supabase) => {
    try {
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
  }, request)
}

// POST /api/tickets - Create ticket
export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(async (req, supabase) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        )
      }
      
      // Get and validate request body
      const body = await req.json()
      const validation = validateTicketCreate(body)
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error },
          { status: 400 }
        )
      }

      const ticketData: TicketCreate & { customer_id: string; status: 'open' } = {
        ...body,
        customer_id: user.id,
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
  }, request)
} 