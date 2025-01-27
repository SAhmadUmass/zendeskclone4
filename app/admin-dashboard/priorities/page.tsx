"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Ticket {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

const priorities = ["low", "medium", "high"] as const
type Priority = typeof priorities[number]

export default function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin-dashboard/priorities', {
          credentials: 'include'
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch tickets')
        }

        const result = await response.json()
        setTickets(result.data || [])
      } catch (err) {
        console.error('Error fetching tickets:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [])

  const handleUpdatePriority = async (ticketId: string, newPriority: Priority) => {
    try {
      const response = await fetch('/api/admin-dashboard/priorities', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ticketId, priority: newPriority })
      })

      if (!response.ok) {
        throw new Error('Failed to update priority')
      }

      const result = await response.json()

      // Update local state
      setTickets(tickets.map(ticket => 
        ticket.id === ticketId ? { ...ticket, priority: newPriority } : ticket
      ))
    } catch (err) {
      console.error('Error updating priority:', err)
      setError(err instanceof Error ? err.message : 'Failed to update priority')
    }
  }

  const filteredTickets = selectedPriority === 'all' || !selectedPriority 
    ? tickets 
    : tickets.filter((ticket) => ticket.priority === selectedPriority)

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
        <h1 className="text-3xl font-semibold mb-6">Ticket Priorities</h1>
        <div className="mb-6">
          <Skeleton className="h-10 w-[180px]" />
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
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
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
      <h1 className="text-3xl font-semibold mb-6">Ticket Priorities</h1>
      <div className="mb-6">
        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {priorities.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
              <TableCell>{ticket.id.slice(0, 8)}</TableCell>
              <TableCell>{ticket.title}</TableCell>
              <TableCell>
                <Badge variant={ticket.status === "open" ? "default" : "secondary"}>
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  ticket.priority === "high" ? "destructive" :
                  ticket.priority === "medium" ? "default" :
                  "secondary"
                }>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Select 
                  value={ticket.priority} 
                  onValueChange={(value) => handleUpdatePriority(ticket.id, value as Priority)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
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

