"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type Ticket = {
  id: string
  subject: string
  status: "open" | "closed"
  priority: "low" | "medium" | "high"
  assignedTo: string
  createdAt: string
}

const dummyTickets: Ticket[] = [
  {
    id: "1",
    subject: "Cannot access account",
    status: "open",
    priority: "high",
    assignedTo: "John Doe",
    createdAt: "2023-04-01T10:00:00Z",
  },
  {
    id: "2",
    subject: "Feature request: Dark mode",
    status: "open",
    priority: "low",
    assignedTo: "Jane Smith",
    createdAt: "2023-04-02T14:30:00Z",
  },
  {
    id: "3",
    subject: "Billing issue",
    status: "closed",
    priority: "medium",
    assignedTo: "Mike Johnson",
    createdAt: "2023-04-03T09:15:00Z",
  },
  {
    id: "4",
    subject: "App crashes on startup",
    status: "open",
    priority: "high",
    assignedTo: "Sarah Lee",
    createdAt: "2023-04-04T16:45:00Z",
  },
  {
    id: "5",
    subject: "How to reset password?",
    status: "closed",
    priority: "low",
    assignedTo: "John Doe",
    createdAt: "2023-04-05T11:20:00Z",
  },
]

export function TicketsTable({ limit = Number.POSITIVE_INFINITY }: { limit?: number }) {
  const tickets = dummyTickets.slice(0, limit)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>{ticket.id}</TableCell>
            <TableCell>{ticket.subject}</TableCell>
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
            <TableCell>{ticket.assignedTo}</TableCell>
            <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

