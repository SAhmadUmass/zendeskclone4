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
    // Set up realtime subscription for resolved tickets
    const channel = supabase
      .channel('resolved-tickets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: 'status=eq.resolved'  // Only listen for updates where status is resolved
        },
        (payload: RealtimePostgresChangesPayload<Ticket>) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            onTicketResolved?.(payload.new)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [supabase, onTicketResolved])

  return null // This is a logic-only component
} 