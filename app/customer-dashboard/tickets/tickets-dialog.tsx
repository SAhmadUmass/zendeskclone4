"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { Ticket } from "./columns"
import { Loader2, Send } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TicketsDialogProps {
  tickets: Ticket[]
  isSupport?: boolean
  onTicketSelect?: (ticket: Ticket | null) => void
}

export function TicketsDialog({ 
  tickets, 
  isSupport = false,
  onTicketSelect 
}: TicketsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null)
  const [message, setMessage] = React.useState("")

  // Simulate loading state for table data
  React.useEffect(() => {
    if (open) {
      setLoading(true)
      // Simulate network delay
      const timer = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [open])

  // Handle row click to select ticket
  const handleRowClick = React.useCallback((ticket: Ticket) => {
    if (onTicketSelect) {
      onTicketSelect(ticket)
      setOpen(false)
    } else {
      setSelectedTicket(ticket)
    }
  }, [onTicketSelect])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedTicket) return

    // TODO: Implement message sending
    console.log('Sending message:', message, 'for ticket:', selectedTicket.id)
    setMessage("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <span className="flex items-center gap-2">
            {isSupport ? 'View All Tickets' : 'View Your Tickets'}
            {tickets.length > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {tickets.length}
              </span>
            )}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isSupport ? 'All Support Tickets' : 'Your Support Tickets'}
          </DialogTitle>
          <DialogDescription>
            {isSupport 
              ? 'View and manage all customer support requests'
              : 'View and manage your support requests'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-1 gap-4 min-h-0">
          {/* Tickets List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-muted-foreground">
                No tickets found
              </div>
            ) : (
              <DataTable 
                columns={columns} 
                data={tickets} 
                onRowClick={handleRowClick}
                selectedId={selectedTicket?.id}
              />
            )}
          </div>

          {/* Chat Section */}
          {selectedTicket && (
            <Card className="flex-1 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Chat with Agent</h3>
                <p className="text-sm text-muted-foreground">
                  Ticket: {selectedTicket.title}
                </p>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Example message - replace with real messages */}
                  <div className="flex items-start gap-2">
                    <Avatar>
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">
                        Hello! How can I help you with &quot;{selectedTicket.title}&quot;?
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message here"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 