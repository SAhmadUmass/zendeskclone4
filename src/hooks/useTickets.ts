import { useSupabaseQuery } from './useSupabaseQuery'
import { useSupabaseRealtime } from './useSupabaseRealtime'
import { createClient } from '@/utils/supabase/client'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

export type Ticket = {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string
  created_at: string
  customer: {
    id: string
    full_name: string
  }
}

type RawTicket = {
  id: string
  title: string
  status: string
  priority: string
  assigned_to: string
  created_at: string
  profiles: {
    id: string
    full_name: string
  }
}

type UseTicketsOptions = {
  status?: string
  priority?: string
  limit?: number
}

export function useTickets({ status, priority, limit }: UseTicketsOptions = {}) {
  const supabase = createClient()

  const buildQuery = () => {
    let query = supabase
      .from('requests')
      .select(`
        id, 
        title, 
        status, 
        priority, 
        assigned_to, 
        created_at,
        profiles!customer_id (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (priority) {
      query = query.eq('priority', priority)
    }
    if (limit) {
      query = query.limit(limit)
    }

    return query as unknown as PostgrestFilterBuilder<any, any, RawTicket[], any, any>
  }

  const { data: rawTickets, loading, error } = useSupabaseQuery<RawTicket>({
    queryFn: buildQuery,
    dependencies: [status, priority, limit]
  })

  // Transform the data to match our Ticket type
  const tickets = rawTickets?.map((ticket: RawTicket): Ticket => ({
    ...ticket,
    customer: ticket.profiles
  }))

  // Set up real-time updates
  useSupabaseRealtime({
    table: 'requests',
    onUpdate: () => {
      // The query will automatically re-run due to the subscription
    }
  })

  return { tickets, loading, error }
} 