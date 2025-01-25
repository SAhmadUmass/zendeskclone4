import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export type Ticket = {
  id: string
  title: string
  description: string
  status: 'new' | 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  customer_id: string
  created_at: string
  updated_at: string
  customer?: {
    full_name: string
    email: string
  }
}

export type UseTicketsProps = {
  status?: 'new' | 'open' | 'closed'
  priority?: 'low' | 'medium' | 'high'
}

export function useTickets({ status, priority }: UseTicketsProps = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    fetchTickets()
  }, [status, priority])

  async function fetchTickets() {
    try {
      setLoading(true)
      setError(null)

      // First verify auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Auth session error:', sessionError)
        setError('Authentication error')
        router.push('/login')
        return
      }

      if (!session) {
        console.error('No session found')
        setError('No active session')
        router.push('/login')
        return
      }

      // Get user's profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        setError('Could not fetch user profile')
        return
      }

      if (!profile) {
        console.error('No profile found for user:', session.user.id)
        setError('User profile not found')
        return
      }

      let query = supabase
        .from('requests')
        .select(`
          *,
          customer:customer_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }
      if (priority) {
        query = query.eq('priority', priority)
      }

      const { data, error: ticketsError } = await query

      if (ticketsError) {
        console.error('Error details:', ticketsError)
        throw ticketsError
      }

      setTickets(data || [])
    } catch (err) {
      setError('Failed to fetch tickets')
      console.error('Error fetching tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateTicket(ticket: Ticket) {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('requests')
        .update({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id)

      if (updateError) {
        console.error('Error details:', updateError)
        throw updateError
      }

      // Refresh the tickets list
      await fetchTickets()
    } catch (err) {
      setError('Failed to update ticket')
      console.error('Error updating ticket:', err)
      throw err
    }
  }

  return { tickets, loading, error, updateTicket }
} 
