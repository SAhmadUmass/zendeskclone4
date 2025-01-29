"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { TicketStatus, TicketPriority } from "@/app/api/tickets/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type DbResult<T> = T extends (...args: any[]) => any
  ? Awaited<ReturnType<T>>
  : never

type TicketRow = {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  customer_id: string
  customer: {
    full_name: string | null
  } | null
  profiles: {
    id: string
    full_name: string | null
  } | null
}

interface AdminTicket {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  assigned_to: string | null
  customer_id: string
  customer: {
    full_name: string | null
  } | null
  profiles: {
    full_name: string | null
  } | null
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
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        console.log('Supabase client created')
        
        // Fetch tickets with assignee and customer names
        const { data: rawTickets, error: ticketsError } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            priority,
            assigned_to,
            customer_id,
            customer:profiles!customer_id (
              full_name
            ),
            profiles:profiles!assigned_to (
              id,
              full_name
            )
          `)
          .order('created_at', { ascending: false })

        if (ticketsError) {
          console.error('Tickets fetch error:', ticketsError)
          throw ticketsError
        }

        // Fetch support staff (users with role 'support')
        console.log('Fetching support staff...')
        const response = await fetch('/api/admin-dashboard/users', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch support staff')
        }

        const result = await response.json()
        const staffData = result.data || []

        console.log('Support staff:', staffData)
        console.log('Raw tickets:', rawTickets)

        // Transform the response to match our AdminTicket interface
        const transformedTickets = (rawTickets || []).map((rawTicket: any): AdminTicket => {
          const assignedStaff = staffData.find((staff: SupportStaff) => staff.id === rawTicket.assigned_to)
          console.log('Processing ticket:', {
            id: rawTicket.id,
            assigned_to: rawTicket.assigned_to,
            staffMatch: assignedStaff?.full_name,
            customer: rawTicket.customer
          })
          
          return {
            id: rawTicket.id,
            title: rawTicket.title,
            status: rawTicket.status,
            priority: rawTicket.priority,
            assigned_to: rawTicket.assigned_to,
            customer_id: rawTicket.customer_id,
            customer: rawTicket.customer,
            profiles: rawTicket.profiles?.[0] || null
          }
        })

        setTickets(transformedTickets)
        setSupportStaff(staffData || [])
      } catch (err) {
        console.error('Error details:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssign = async (ticketId: string, staffId: string | null) => {
    try {
      const response = await fetch('/api/admin-dashboard/tickets/assign', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, staffId }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to assign ticket')
      }

      const { data } = await response.json()
      console.log('Server response:', data)

      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            assigned_to: data.assigned_to,
            profiles: data.profiles?.[0] || null // Transform array to single object
          }
        }
        return ticket
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign ticket')
    }
  }

  const handleDelete = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin-dashboard/tickets/delete?id=${ticketId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete ticket')
      }

      // Update local state
      setTickets(tickets.filter(ticket => ticket.id !== ticketId))
      setTicketToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete ticket')
    }
  }

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const response = await fetch('/api/admin-dashboard/tickets/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, status: newStatus }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update ticket status')
      }

      // Update local state
      setTickets(tickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            status: newStatus
          }
        }
        return ticket
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket status')
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
              <TableHead>Customer</TableHead>
              <TableHead>Assign To</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[40px]" /></TableCell>
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
            <TableHead>Customer</TableHead>
            <TableHead>Assign To</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>
                <Select 
                  value={ticket.status} 
                  onValueChange={(value) => handleStatusUpdate(ticket.id, value as TicketStatus)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>{ticket.status}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>{ticket.customer?.full_name || "Unknown"}</TableCell>
              <TableCell>
                <Select 
                  value={ticket.assigned_to || "unassigned"} 
                  onValueChange={(value) => handleAssign(ticket.id, value === "unassigned" ? null : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      {(() => {
                        const assignedStaff = supportStaff.find(s => s.id === ticket.assigned_to)
                        return ticket.assigned_to && assignedStaff ? assignedStaff.full_name : "Unassigned"
                      })()}
                    </SelectValue>
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
              <TableCell>
                <Dialog open={ticketToDelete === ticket.id} onOpenChange={(open) => !open && setTicketToDelete(null)}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => setTicketToDelete(ticket.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Ticket</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this ticket? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setTicketToDelete(null)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleDelete(ticket.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

