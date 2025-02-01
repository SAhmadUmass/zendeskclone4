'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface Ticket {
  id: string
  title: string
  status: string
  customer_id: string
  created_at: string
  summary?: string
  summary_generated_at?: string
}

// Define valid ticket statuses
const VALID_TICKET_STATUSES = ['open', 'in_progress', 'resolved'] as const
type TicketStatus = typeof VALID_TICKET_STATUSES[number]

interface ResolvedTicketsRealtimeProps {
  onTicketResolved?: (ticket: Ticket) => void
}

type TicketUpdate = {
  eventType: 'UPDATE'
  old: Partial<Ticket>
  new: Ticket
}

// Helper to check if a status is valid
const isValidStatus = (status: string | undefined): status is TicketStatus => {
  return typeof status === 'string' && VALID_TICKET_STATUSES.includes(status as TicketStatus)
}

// Helper to check if status is specifically 'resolved'
const isResolved = (status: TicketStatus): boolean => status === 'resolved'

export function ResolvedTicketsRealtime({ onTicketResolved }: ResolvedTicketsRealtimeProps) {
  const supabase = createClient()

  useEffect(() => {
    console.log('Setting up realtime subscription for resolved tickets')
    
    const channel = supabase
      .channel('resolved-tickets')
      .on(
        'postgres_changes' as const,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests'
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          const update = payload as TicketUpdate
          
          // Validate status values
          const oldStatus = update.old?.status
          const newStatus = update.new?.status

          // Log the payload for debugging
          console.log('Received payload:', { 
            old: update.old,
            new: update.new,
              oldStatus,
            newStatus
            })

          // If newStatus is resolved and either oldStatus is undefined or different from resolved
          if (newStatus === 'resolved' && (!oldStatus || oldStatus !== 'resolved')) {
            console.log('✅ Ticket resolved, updating UI:', update.new.id)
            onTicketResolved?.(update.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    return () => {
      console.log('Cleaning up subscription')
      channel.unsubscribe()
    }
  }, [supabase, onTicketResolved])

  return null
} 