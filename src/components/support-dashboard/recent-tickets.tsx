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
  assignee: {
    id: string
    full_name: string | null
    role: string
  } | null
}

export function RecentTickets({ limit }: { limit: number }) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    
    const fetchTickets = async () => {
      try {
        setError(null)
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw new Error('Failed to get user: ' + userError.message)
        if (!user) throw new Error('No authenticated user found')

        // Store user ID
        setUserId(user.id)

        // Get user's role from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profileError) throw new Error('Failed to get user profile: ' + profileError.message)
        if (!profile) throw new Error('No profile found for user')
        if (!['admin', 'support'].includes(profile.role)) {
          throw new Error('User does not have permission to view tickets')
        }

        // Fetch tickets assigned to current user
        const { data: rawTickets, error: ticketsError } = await supabase
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
            ),
            assignee:profiles!assigned_to (
              id,
              full_name,
              role
            )
          `)
          .eq('assigned_to', user.id)
          .order('created_at', { ascending: false })
          .returns<RawTicket[]>()

        if (ticketsError) throw new Error('Failed to fetch tickets: ' + ticketsError.message)
        if (!rawTickets) throw new Error('No tickets data received')

        // Transform and validate the data
        const validTickets: Ticket[] = rawTickets.map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          status: ticket.status,
          priority: ticket.priority,
          assigned_to: ticket.assignee?.full_name || 'Unassigned',
          created_at: ticket.created_at,
          customer: {
            id: ticket.customer?.id || ticket.customer_id,
            full_name: ticket.customer?.full_name || 'Unknown Customer'
          }
        }))

        setTickets(validTickets)
      } catch (err) {
        console.error('Error in RecentTickets:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchTickets()

    // Set up realtime subscription only if we have a userId
    let channel = null
    if (userId) {
      channel = supabase
        .channel('requests_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'requests',
            filter: `assigned_to=eq.${userId}`
          },
          () => {
            // Refetch tickets when changes occur
            fetchTickets()
          }
        )
        .subscribe()
    }

    // Cleanup subscription
    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [userId])

  if (error) {
    return (
      <div className="text-red-500 p-4 rounded-md bg-red-50">
        Error: {error}
      </div>
    )
  }

  return <TicketsTable tickets={tickets} loading={loading} limit={limit} />
} 