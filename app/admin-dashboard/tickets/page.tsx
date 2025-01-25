"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TicketStatus, TicketPriority } from "@/app/api/tickets/types"

// This interface matches the actual shape of data from Supabase
interface AdminTicket {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  profiles: {
    full_name: string | null
  } | null
}

// Type for the raw response from Supabase
type SupabaseTicketResponse = {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  profiles: {
    full_name: string | null
  }[] | null
}

interface SupportStaff {
  id: string
  full_name: string
}

export default function Page() {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [supportStaff, setSupportStaff] = useState<SupportStaff[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Fetch tickets with assignee names
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            priority,
            assigned_to,
            profiles:assigned_to (
              full_name
            )
          `)
          .order('created_at', { ascending: false })

        if (ticketsError) throw ticketsError

        // Fetch support staff (users with role 'support')
        const { data: staffData, error: staffError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'support')

        if (staffError) throw staffError

        // Transform the response to match our AdminTicket interface
        const transformedTickets: AdminTicket[] = (ticketsData || []).map((ticket: SupabaseTicketResponse) => ({
          ...ticket,
          profiles: ticket.profiles?.[0] || null
        }))

        setTickets(transformedTickets)
        setSupportStaff(staffData || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssign = async (ticketId: string, staffId: string | null) => {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('requests')
        .update({ assigned_to: staffId })
        .eq('id', ticketId)

      if (error) throw error

      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          const assignedStaff = supportStaff.find(staff => staff.id === staffId)
          return {
            ...ticket,
            assigned_to: staffId,
            profiles: assignedStaff ? {
              full_name: assignedStaff.full_name
            } : null
          }
        }
        return ticket
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket')
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-semibold mb-6">Ticket Assignment</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[180px]" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Ticket Assignment</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>{ticket.profiles?.full_name || "Unassigned"}</TableCell>
              <TableCell>
                <Select 
                  value={ticket.assigned_to || "unassigned"} 
                  onValueChange={(value) => handleAssign(ticket.id, value === "unassigned" ? null : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassign</SelectItem>
                    {supportStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

