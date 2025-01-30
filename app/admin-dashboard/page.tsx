"use client"

import { Card } from "@/components/ui/card"
import { CardContent } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { Ticket, Users, AlertTriangle } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { ResolvedTicketsNotifier } from './resolved-tickets'

interface DashboardMetrics {
  totalTickets: number
  totalCustomers: number
  highPriorityTickets: number
}

export default function Page() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTickets: 0,
    totalCustomers: 0,
    highPriorityTickets: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchMetrics = async () => {
      try {
        // Check session first
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setError('Please log in to view dashboard metrics')
          setIsLoading(false)
          return
        }

        // Fetch metrics in parallel
        const [totalTickets, totalCustomers, highPriorityTickets] = await Promise.all([
          // Get total tickets
          supabase
            .from('requests')
            .select('*', { count: 'exact', head: true }),
          
          // Get total customers (users with role 'customer')
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer'),
          
          // Get high priority tickets
          supabase
            .from('requests')
            .select('*', { count: 'exact', head: true })
            .eq('priority', 'high')
        ])

        setMetrics({
          totalTickets: totalTickets.count ?? 0,
          totalCustomers: totalCustomers.count ?? 0,
          highPriorityTickets: highPriorityTickets.count ?? 0
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching metrics:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchMetrics()

    // Set up auth state listener for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Refetch metrics when auth state changes to logged in
        fetchMetrics()
      } else {
        setError('Please log in to view dashboard metrics')
        setMetrics({
          totalTickets: 0,
          totalCustomers: 0,
          highPriorityTickets: 0
        })
      }
    })

    // Set up real-time subscription for metrics updates
    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests'
        },
        () => {
          // Only refetch if we have a session
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              fetchMetrics()
            }
          })
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      channel.unsubscribe()
    }
  }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="text-red-500 mb-4">{error}</div>
        <a href="/employee-login" className="text-blue-500 hover:underline">
          Return to login
        </a>
      </div>
    )
  }

  return (
    <div>
      <ResolvedTicketsNotifier />
      <h1 className="text-3xl font-semibold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : metrics.totalTickets.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total tickets in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : metrics.totalCustomers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "Loading..." : metrics.highPriorityTickets.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current high priority tickets</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

