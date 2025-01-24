import { useSupabaseQuery } from './useSupabaseQuery'
import { useSupabaseRealtime } from './useSupabaseRealtime'
import { createClient } from '@/utils/supabase/client'

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

    return query
  }

  const { data: rawTickets, loading, error } = useSupabaseQuery<any>({
    queryFn: buildQuery,
    dependencies: [status, priority, limit]
  })

  // Transform the data to match our Ticket type
  const tickets = rawTickets?.map((ticket: any) => ({
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