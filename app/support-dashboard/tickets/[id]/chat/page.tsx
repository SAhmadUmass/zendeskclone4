'use client'

import { useEffect, useState, use } from 'react'
import { Chat } from '@/components/support-dashboard/Chat'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CustomerProfile {
  id: string
  full_name: string
}

interface Ticket {
  id: string
  title: string
  customer: CustomerProfile
}

export default function TicketChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchTicket() {
      try {
        // First fetch the ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('requests')
          .select('id, title, customer_id')
          .eq('id', resolvedParams.id)
          .single()

        if (ticketError) throw ticketError

        // Then fetch the customer profile
        const { data: customerData, error: customerError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', ticketData.customer_id)
          .single()

        if (customerError) throw customerError
        
        setTicket({
          id: ticketData.id,
          title: ticketData.title,
          customer: {
            id: customerData.id,
            full_name: customerData.full_name
          }
        })
      } catch (err) {
        console.error('Error fetching ticket:', err)
        setError('Failed to load ticket details')
      }
    }

    fetchTicket()
  }, [resolvedParams.id, supabase])

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>
    )
  }

  if (!ticket) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
      </div>

      <Chat
        ticketId={ticket.id}
        customerName={ticket.customer.full_name}
        ticketTitle={ticket.title}
      />
    </div>
  )
} 