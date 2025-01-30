'use client'

import { toast } from 'sonner'
import { ResolvedTicketsRealtime, type Ticket } from "./components/resolved-tickets-realtime"
import { createClient } from '@/utils/supabase/client'

export function ResolvedTicketsNotifier() {
  const handleTicketResolved = (ticket: Ticket) => {
    console.log('handleTicketResolved called with ticket:', ticket)
    
    // Show toast immediately using sonner
    toast.success('Ticket Resolved', {
      description: `Ticket "${ticket.title}" has been marked as resolved.`,
      duration: 5000,
    })
    console.log('Toast called')

    // Trigger summarization in a separate async operation
    void (async () => {
      try {
        console.log('Starting summarization for ticket:', ticket.id)
        const response = await fetch(`/api/tickets/${ticket.id}/summarize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for cookies
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.details || 'Failed to generate summary')
        }

        const result = await response.json()
        console.log('Summarization completed:', result)
        
        // Show success toast for summary
        toast.success('Summary Generated', {
          description: 'The ticket summary has been generated and saved.',
          duration: 3000,
        })
      } catch (error) {
        console.error('Failed to generate summary:', error)
        // Show error toast
        toast.error('Summary Generation Failed', {
          description: error instanceof Error ? error.message : 'Failed to generate summary',
        })
      }
    })()
  }

  console.log('Rendering ResolvedTicketsNotifier')
  return (
    <ResolvedTicketsRealtime 
      onTicketResolved={handleTicketResolved}
    />
  )
} 
