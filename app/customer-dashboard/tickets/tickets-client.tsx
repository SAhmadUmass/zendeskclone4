'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { TicketsDialog } from './tickets-dialog'
import { Ticket } from './columns'
import { PostgrestError } from '@supabase/supabase-js'

function logSupabaseError(context: string, error: PostgrestError | Error, details?: object) {
  console.error(`Supabase Error [${context}]:`, {
    message: error.message,
    code: 'code' in error ? error.code : undefined,
    details: 'details' in error ? error.details : undefined,
    hint: 'hint' in error ? error.hint : undefined,
    ...details
  })
}

interface TicketsClientProps {
  onTicketSelect?: (ticket: Ticket | null) => void
}

export function TicketsClient({ onTicketSelect }: TicketsClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupport, setIsSupport] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadTickets() {
      try {
        const supabase = createClient()
        
        // First verify auth is working
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          logSupabaseError('Auth Session', sessionError, {
            hasToken: !!supabase.auth.getSession()
          })
          setError('Authentication error')
          return
        }
        
        if (!session) {
          console.error('No session found')
          setError('No active session')
          return
        }

        console.log('Auth session:', {
          user: session.user.id,
          expires_at: session.expires_at,
          token: session.access_token ? 'present' : 'missing'
        })

        // Get user's profile to check role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          logSupabaseError('Profile Fetch', profileError, {
            userId: session.user.id,
            sessionExpires: session.expires_at
          })
          setError('Could not fetch user profile')
          return
        }

        if (!profile) {
          console.error('No profile found for user:', session.user.id)
          setError('User profile not found')
          return
        }

        const isUserSupport = profile.role === 'support'
        setIsSupport(isUserSupport)

        // Now proceed with main query...
        // Step 1: Get tickets with explicit columns
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            created_at,
            customer_id
          `)
          .eq('customer_id', session.user.id)
          .order('created_at', { ascending: false })

        if (ticketsError) {
          logSupabaseError('Tickets Fetch', ticketsError, {
            userId: session.user.id,
            role: profile.role,
            query: 'requests with explicit columns'
          })
          setError('Could not fetch tickets')
          return
        }

        if (!ticketsData || ticketsData.length === 0) {
          console.log('No tickets found')
          setTickets([])
          return
        }

        // Step 2: Get associated profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ticketsData.map(t => t.customer_id))

        if (profilesError) {
          logSupabaseError('Profiles Fetch', profilesError, {
            ticketsFound: ticketsData.length,
            userRole: profile.role
          })
          setError('Could not fetch profile information')
          return
        }

        // Create a map of profiles for easy lookup
        const profileMap = new Map(
          profilesData?.map(p => [p.id, p]) ?? []
        )

        // Transform the data to match our Ticket type
        const transformedTickets = ticketsData.map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          status: ticket.status as "new" | "open" | "closed",
          priority: ticket.priority as "low" | "medium" | "high",
          created_at: ticket.created_at,
          customer_id: ticket.customer_id,
          profiles: {
            full_name: profileMap.get(ticket.customer_id)?.full_name ?? 'Unknown'
          }
        }))

        console.log('Query results:', {
          ticketsFound: ticketsData.length,
          profilesFound: profilesData?.length ?? 0,
          sampleTicket: transformedTickets[0]
        })

        setTickets(transformedTickets)
      } catch (error) {
        console.error('Unexpected error:', error)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [])

  if (loading) return null
  if (error) return <div className="text-red-500">Error: {error}</div>

  return <TicketsDialog tickets={tickets} isSupport={isSupport} onTicketSelect={onTicketSelect} />
} 