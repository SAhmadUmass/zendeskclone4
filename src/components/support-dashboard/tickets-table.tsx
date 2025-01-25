"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

type Ticket = {
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

interface TicketsTableProps {
  tickets?: Ticket[]
  loading: boolean
}

export function TicketsTable({ tickets = [], loading }: TicketsTableProps) {
  const router = useRouter()

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
      {[...Array(5)].map((_, i) => (
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
      {tickets.map((ticket) => (
        <TableRow 
          key={ticket.id} 
          className="hover:bg-muted/50 cursor-pointer"
        >
          <TableCell>{ticket.customer.full_name}</TableCell>
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
      {loading ? renderLoadingSkeleton() : tickets.length === 0 ? renderEmptyState() : renderTickets()}
    </Table>
  )
}

