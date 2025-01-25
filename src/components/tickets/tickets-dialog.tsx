"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DataTable } from "./data-table"
import { columns } from "@/app/customer-dashboard/tickets/columns"
import { Ticket } from "@/app/customer-dashboard/tickets/columns"
import { createClient } from "@/utils/supabase/client"

export function TicketsDialog() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const supabase = createClient()

  const fetchTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching tickets:", error)
      return
    }

    setTickets(data || [])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={fetchTickets}>View My Tickets</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>My Support Tickets</DialogTitle>
        </DialogHeader>
        <DataTable columns={columns} data={tickets} />
      </DialogContent>
    </Dialog>
  )
} 