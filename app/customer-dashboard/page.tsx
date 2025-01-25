'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateRequestForm } from "@/components/create-request-form"
import { TicketsClient } from "./tickets/tickets-client"
import { Chat } from "./tickets/chat"
import { Ticket } from "./tickets/columns"
import { useState } from "react"

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Support Dashboard</h1>
        <div className="flex gap-4 items-center">
          <TicketsClient onTicketSelect={setSelectedTicket} />
          <Button onClick={handleSignOut} variant="outline">
            Sign out
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create New Support Request</h2>
          <CreateRequestForm />
        </div>

        {selectedTicket && (
          <Chat ticket={selectedTicket} />
        )}
      </div>
    </div>
  )
} 