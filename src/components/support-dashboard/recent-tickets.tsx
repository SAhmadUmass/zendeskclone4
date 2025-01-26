"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { TicketsTable } from "./tickets-table"

type Ticket = {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string
  customer: {
    id: string
    full_name: string | null
  } | null
}

interface RawTicket {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string | null
  created_at: string
  customer_id: string
  customer: {
    id: string
    full_name: string | null
  } | null
}

export function RecentTickets({ limit }: { limit: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const supabase = createClient()
        const { data: rawTickets, error } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            priority,
            assigned_to,
            created_at,
            customer_id,
            customer:profiles!customer_id (
              id,
              full_name
            )
          `)
          .order('created_at', { ascending: false })
          .returns<RawTicket[]>()

        if (error) throw error

        // Transform and validate the data
        const validTickets: Ticket[] = (rawTickets || []).map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          assigned_to: ticket.assigned_to,
          created_at: ticket.created_at,
          customer: ticket.customer || {
            id: ticket.customer_id,
            full_name: 'Unknown Customer'
          }
        }))

        setTickets(validTickets)
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  return <TicketsTable tickets={tickets} loading={loading} limit={limit} />
} 