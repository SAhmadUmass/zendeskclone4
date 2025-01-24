"use client"

import { useState } from "react"
import { TicketsTable } from "@/components/support-dashboard/tickets-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useTickets, type Ticket } from "@/hooks/useTickets"

type TicketStatus = 'open' | 'closed'
type TicketPriority = 'low' | 'medium' | 'high'

export default function TicketsPage() {
  const [status, setStatus] = useState<TicketStatus | undefined>()
  const [priority, setPriority] = useState<TicketPriority | undefined>()
  
  const { tickets = [], loading, error } = useTickets({
    status,
    priority
  })

  const handleStatusChange = (value: string) => {
    setStatus(value === 'all' ? undefined : value as TicketStatus)
  }

  const handlePriorityChange = (value: string) => {
    setPriority(value === 'all' ? undefined : value as TicketPriority)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Button>New Ticket</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-4">
        <Select onValueChange={(value: string) => handleStatusChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value: string) => handlePriorityChange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TicketsTable tickets={tickets} loading={loading} />
    </div>
  )
}

