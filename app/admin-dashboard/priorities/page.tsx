"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for tickets
const initialTickets = [
  { id: 1, title: "Login issue", status: "Open", priority: "High" },
  { id: 2, title: "Payment failed", status: "In Progress", priority: "Medium" },
  { id: 3, title: "Feature request", status: "Open", priority: "Low" },
]

const priorities = ["Low", "Medium", "High", "Urgent"]

export default function Page() {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>()

  const handleUpdatePriority = (ticketId: number, newPriority: string) => {
    setTickets(tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, priority: newPriority } : ticket)))
  }

  const filteredTickets = selectedPriority ? tickets.filter((ticket) => ticket.priority === selectedPriority) : tickets

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Ticket Priorities</h1>
      <div className="mb-6">
        <Select onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => handleUpdatePriority(ticket.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
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

