"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

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
  }
}

interface TicketsTableProps {
  limit?: number
}

export function TicketsTable({ limit }: TicketsTableProps) {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const displayedTickets = limit ? tickets.slice(0, limit) : tickets

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('requests')
          .select(`
            id,
            title,
            status,
            priority,
            assigned_to,
            created_at,
            customer:customer_id (
              id,
              full_name
            )
          `)
          .order('created_at', { ascending: false })
          .returns<Ticket[]>()

        if (error) throw error
        setTickets(data || [])
      } catch (err) {
        console.error('Error fetching tickets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const handleChatClick = (ticketId: string) => {
    router.push(`/support-dashboard/tickets/${ticketId}/chat`)
  }

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead>Customer</TableHead>
        <TableHead>Subject</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Assigned To</TableHead>
        <TableHead>Created At</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  )

  const renderLoadingSkeleton = () => (
    <TableBody>
      {[...Array(limit || 5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  const renderEmptyState = () => (
    <TableBody>
      <TableRow>
        <TableCell colSpan={7} className="text-center py-4">
          No tickets found
        </TableCell>
      </TableRow>
    </TableBody>
  )

  const renderTickets = () => (
    <TableBody>
      {displayedTickets.map((ticket) => (
        <TableRow 
          key={ticket.id} 
          className="hover:bg-muted/50 cursor-pointer"
        >
          <TableCell>{ticket.customer.full_name || 'Unknown'}</TableCell>
          <TableCell>{ticket.title}</TableCell>
          <TableCell>
            <Badge variant={ticket.status === "open" ? "default" : "secondary"}>{ticket.status}</Badge>
          </TableCell>
          <TableCell>
            <Badge
              variant={
                ticket.priority === "high" ? "destructive" : ticket.priority === "medium" ? "default" : "secondary"
              }
            >
              {ticket.priority}
            </Badge>
          </TableCell>
          <TableCell>{ticket.assigned_to || 'Unassigned'}</TableCell>
          <TableCell>{new Date(ticket.created_at).toLocaleString()}</TableCell>
          <TableCell>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                handleChatClick(ticket.id)
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )

  return (
    <Table>
      {renderTableHeader()}
      {loading ? renderLoadingSkeleton() : displayedTickets.length === 0 ? renderEmptyState() : renderTickets()}
    </Table>
  )
}

