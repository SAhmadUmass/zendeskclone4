"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for tickets
const tickets = [
  { id: 1, title: "Login issue", status: "Open", priority: "High", assignedTo: "" },
  { id: 2, title: "Payment failed", status: "In Progress", priority: "Medium", assignedTo: "John Doe" },
  { id: 3, title: "Feature request", status: "Open", priority: "Low", assignedTo: "" },
]

// Mock data for support staff
const supportStaff = ["John Doe", "Jane Smith", "Mike Johnson"]

export default function Page() {
  const [ticketList, setTicketList] = useState(tickets)

  const handleAssign = (ticketId: number, staff: string) => {
    setTicketList(ticketList.map((ticket) => (ticket.id === ticketId ? { ...ticket, assignedTo: staff } : ticket)))
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
          {ticketList.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>{ticket.assignedTo || "Unassigned"}</TableCell>
              <TableCell>
                <Select onValueChange={(value) => handleAssign(ticket.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supportStaff.map((staff) => (
                      <SelectItem key={staff} value={staff}>
                        {staff}
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

