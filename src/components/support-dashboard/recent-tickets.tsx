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
  }
}

export function RecentTickets({ limit }: { limit: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            priority,
            assigned_to,
            created_at,
            customer:customer_id (
              id,
              full_name
            )
          `)
          .order('created_at', { ascending: false })
          .returns<Ticket[]>()

        if (error) throw error
        setTickets(data || [])
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