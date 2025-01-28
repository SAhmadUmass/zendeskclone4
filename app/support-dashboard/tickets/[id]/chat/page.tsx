'use client'

import { useEffect, useState, use } from 'react'
import { Chat } from '@/components/support-dashboard/Chat'
import { StatusDropdown } from '@/components/support-dashboard/StatusDropdown'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CustomerProfile {
  id: string
  full_name: string | null
}

interface Ticket {
  id: string
  title: string
  status: string
  customer: CustomerProfile
}

interface RawTicket {
  id: string
  title: string
  status: string
  customer: CustomerProfile | null
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
        // First verify auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session) {
          console.error('Auth error:', sessionError)
          setError('Authentication error - please log in again')
          router.push('/login')
          return
        }

        // Fetch ticket with customer data in a single query
        const { data: ticketData, error: ticketError } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            customer:profiles!customer_id (
              id,
              full_name
            )
          `)
          .eq('id', resolvedParams.id)
          .maybeSingle() as { data: RawTicket | null, error: any }

        if (ticketError) {
          console.error('Error fetching ticket:', ticketError)
          throw ticketError
        }

        if (!ticketData) {
          setError('Ticket not found')
          return
        }
        
        setTicket({
          id: ticketData.id,
          title: ticketData.title,
          status: ticketData.status,
          customer: ticketData.customer || {
            id: 'unknown',
            full_name: 'Unknown Customer'
          }
        })
      } catch (err) {
        console.error('Error fetching ticket:', err)
        setError('Failed to load ticket details')
      }
    }

    fetchTicket()
  }, [resolvedParams.id, supabase, router])

  const handleStatusChange = (newStatus: string) => {
    if (ticket) {
      setTicket({ ...ticket, status: newStatus })
    }
  }

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
        customerName={ticket.customer.full_name || 'Unknown Customer'}
        ticketTitle={ticket.title}
      />

      <div className="mt-6">
        <StatusDropdown
          ticketId={ticket.id}
          initialStatus={ticket.status}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
} 