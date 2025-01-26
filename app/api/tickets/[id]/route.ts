import { NextResponse, type NextRequest } from 'next/server'
import { Ticket, TicketUpdate, validateTicketUpdate } from '../types'
import { withAuth } from '@/utils/auth/middleware'
import { handleApiError } from '@/utils/api/error-handler'

// Force dynamic to ensure we always get fresh data
export const dynamic = 'force-dynamic'

// GET /api/tickets/[id] - Get single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params
  return withAuth(async (_req, supabase) => {
    try {
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
        .eq('id', resolvedParams.id)
        .single()

      if (error) throw error

      return NextResponse.json({ data: ticket as Ticket })
    } catch (error) {
      return handleApiError(error, 'Ticket not found')
    }
  }, request)
}

// PUT /api/tickets/[id] - Update ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params
  return withAuth(async (req, supabase) => {
    try {
      // Get and validate request body
      const body = await req.json()
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
      
      // Update ticket (RLS will verify access)
      const { data: ticket, error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', resolvedParams.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        data: ticket as Ticket,
        message: 'Ticket updated successfully'
      })
    } catch (error) {
      return handleApiError(error, 'Ticket not found')
    }
  }, request)
}

// DELETE /api/tickets/[id] - Delete ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const resolvedParams = await params
  return withAuth(async (_req, supabase) => {
    try {
      // Delete ticket (RLS will verify access)
      const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', resolvedParams.id)

      if (error) throw error

      return NextResponse.json({
        message: 'Ticket deleted successfully'
      })
    } catch (error) {
      return handleApiError(error, 'Ticket not found')
    }
  }, request)
} 