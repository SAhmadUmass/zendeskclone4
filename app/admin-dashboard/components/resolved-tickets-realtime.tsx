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
}

interface ResolvedTicketsRealtimeProps {
  onTicketResolved?: (ticket: Ticket) => void
}

export function ResolvedTicketsRealtime({ onTicketResolved }: ResolvedTicketsRealtimeProps) {
  const supabase = createClient()

  useEffect(() => {
    console.log('Setting up realtime subscription')
    
    // Set up realtime subscription for tickets being resolved
    const channel = supabase
      .channel('resolved-tickets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests'
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          console.log('Received realtime update:', payload)
          // Check if this update changed the status to resolved
          if (
            payload.eventType === 'UPDATE' && 
            payload.new && 
            payload.old &&
            payload.old.status !== 'resolved' && 
            payload.new.status === 'resolved'
          ) {
            console.log('Ticket was just resolved:', payload.new)
            onTicketResolved?.(payload.new)
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up subscription')
      channel.unsubscribe()
    }
  }, [supabase, onTicketResolved])

  return null // This is a logic-only component
} 