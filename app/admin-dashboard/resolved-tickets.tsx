'use client'

import { toast } from 'sonner'
import { ResolvedTicketsRealtime, type Ticket } from "./components/resolved-tickets-realtime"

export function ResolvedTicketsNotifier() {
  const handleTicketResolved = (ticket: Ticket) => {
    console.log('Ticket resolved:', ticket)
    
    // Show toast for resolved status
    toast.success('Ticket Resolved', {
      description: `Ticket "${ticket.title}" has been marked as resolved.`,
      duration: 5000,
    })

    // Trigger summarization
    void (async () => {
      try {
        const response = await fetch(`/api/tickets/${ticket.id}/summarize`, {
          method: 'POST',
          credentials: 'include'
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to generate summary')
        }

        const data = await response.json()
        if (data.success) {
          toast.success('Summary Generated', {
            description: 'The ticket summary has been generated successfully.',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Failed to generate summary:', error)
        toast.error('Summary Generation Failed', {
          description: error instanceof Error ? error.message : 'Failed to generate summary',
          duration: 5000,
        })
      }
    })()
  }

  return (
    <ResolvedTicketsRealtime 
      onTicketResolved={handleTicketResolved}
    />
  )
} 
