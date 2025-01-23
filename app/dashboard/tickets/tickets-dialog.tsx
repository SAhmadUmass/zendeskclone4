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
import { Loader2 } from "lucide-react"

interface TicketsDialogProps {
  tickets: Ticket[]
  isSupport?: boolean
}

export function TicketsDialog({ tickets, isSupport = false }: TicketsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // Simulate loading state for table data
  React.useEffect(() => {
    if (open) {
      setLoading(true)
      // Simulate network delay
      const timer = setTimeout(() => setLoading(false), 500)
      return () => clearTimeout(timer)
    }
  }, [open])

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
      <DialogContent className="sm:max-w-[80vw]">
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
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No tickets found
          </div>
        ) : (
          <DataTable columns={columns} data={tickets} />
        )}
      </DialogContent>
    </Dialog>
  )
} 