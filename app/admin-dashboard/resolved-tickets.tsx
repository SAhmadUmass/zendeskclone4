'use client'

import { useToast } from "@/components/ui/use-toast"
import { ResolvedTicketsRealtime, type Ticket } from "./components/resolved-tickets-realtime"

export function ResolvedTicketsNotifier() {
  const { toast } = useToast()

  const handleTicketResolved = (ticket: Ticket) => {
    console.log('handleTicketResolved called with:', ticket)
    toast({
      title: "Ticket Resolved",
      description: `Ticket "${ticket.title}" has been marked as resolved.`,
      duration: 5000,
    })
    console.log('Toast called')
  }

  return (
    <ResolvedTicketsRealtime 
      onTicketResolved={handleTicketResolved}
    />
  )
} 
