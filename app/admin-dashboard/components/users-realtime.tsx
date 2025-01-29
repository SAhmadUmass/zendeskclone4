'use client'

import { useEffect, useState } from 'react'
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
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Check if user is admin/support before subscribing
    async function checkAuthorization() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      return profile?.role === 'admin' || profile?.role === 'support'
    }

    checkAuthorization().then(setIsAuthorized)
  }, [supabase])

  useEffect(() => {
    if (!isAuthorized) return

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
        async (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('Ticket resolved:', payload)
          console.log('New ticket data:', payload.new)

          // Type guard to ensure we have the new data
          if (
            payload.eventType === 'UPDATE' && 
            payload.new && 
            'status' in payload.new &&
            payload.new.status === 'resolved'
          ) {
            console.log('Status is resolved, checking type guard...')
            const newTicket = payload.new as any
            if (isTicket(newTicket)) {
              console.log('Type guard passed, calling onTicketResolved')
              onTicketResolved?.(newTicket)
            } else {
              console.log('Type guard failed. Missing properties:', {
                hasId: typeof newTicket.id === 'string',
                hasTitle: typeof newTicket.title === 'string',
                hasStatus: typeof newTicket.status === 'string',
                hasCustomerId: typeof newTicket.customer_id === 'string',
                hasCreatedAt: typeof newTicket.created_at === 'string'
              })
            }
          } else {
            console.log('Status check failed:', {
              isUpdate: payload.eventType === 'UPDATE',
              hasNew: !!payload.new,
              hasStatus: payload.new && 'status' in payload.new,
              status: payload.new?.status
            })
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [supabase, onTicketResolved, isAuthorized])

  return null // This is a logic-only component
}

// Type guard to ensure we have a valid Ticket
function isTicket(obj: any): obj is Ticket {
  const result = (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.customer_id === 'string' &&
    typeof obj.created_at === 'string'
  )
  console.log('Type guard check result:', result)
  return result
} 

