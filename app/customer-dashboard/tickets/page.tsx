import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { TicketsDialog } from './tickets-dialog'
import { Ticket } from './columns'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

function ErrorMessage({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export default async function TicketsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) throw new Error('Error fetching user data')
    if (!user) return <ErrorMessage message="Please log in to view tickets" />

    // Get user's profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) throw new Error('Error fetching user profile')

    // Fetch tickets based on role
    const query = supabase
      .from('requests')
      .select(`
        id,
        title,
        description,
        status,
        priority,
        created_at,
        customer_id,
        profiles!inner (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    // If user is not support staff, only show their tickets
    if (profile?.role !== 'support') {
      query.eq('customer_id', user.id)
    }

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) throw new Error('Error loading tickets')

    // Transform the data to match our Ticket type
    const transformedTickets = tickets?.map(ticket => ({
      ...ticket,
      profiles: ticket.profiles[0]
    })) ?? []

    return <TicketsDialog 
      tickets={transformedTickets as Ticket[]} 
      isSupport={profile?.role === 'support'} 
    />
  } catch (error) {
    return <ErrorMessage message={error instanceof Error ? error.message : 'An unexpected error occurred'} />
  }
} 