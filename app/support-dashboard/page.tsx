import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTickets } from "@/components/support-dashboard/recent-tickets"

// Helper function to get ticket counts by status
async function getTicketMetrics() {
  const supabase = await createClient()
  
  // Get all counts in parallel for better performance
  const [totalResult, openResult, highPriorityResult] = await Promise.all([
    supabase.from('requests').select('*', { count: 'exact', head: true }),
    supabase.from('requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'high')
      .is('assigned_to', null)
  ])

  return {
    total: totalResult.count ?? 0,
    open: openResult.count ?? 0,
    needingAttention: highPriorityResult.count ?? 0
  }
}

export default async function Dashboard() {
  const metrics = await getTicketMetrics()
  const closedCount = metrics.total - metrics.open

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.open} open, {closedCount} closed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            {/* TODO: Implement resolution time calculation in a separate PR
                 This requires analyzing status change history which needs additional schema work */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Needing Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.needingAttention}</div>
            <p className="text-xs text-muted-foreground">High priority & unassigned</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Tickets</h2>
        <RecentTickets limit={5} />
      </div>
    </div>
  )
}

