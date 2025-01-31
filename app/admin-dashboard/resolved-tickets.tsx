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
  }

  return (
    <ResolvedTicketsRealtime 
      onTicketResolved={handleTicketResolved}
    />
  )
} 
