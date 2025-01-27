'use client'

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateRequestForm } from "@/components/create-request-form"
import { Chat } from "./tickets/chat"
import { Ticket } from "./tickets/columns"
import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { TicketsClient } from "./tickets/tickets-client"

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
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-6 mb-8">
          <h1 className="text-2xl font-bold">Support Dashboard</h1>
          <div className="flex items-center gap-4">
            <CreateRequestForm />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">View Your Tickets</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Your Support Tickets</DialogTitle>
                </DialogHeader>
                <TicketsClient onTicketSelect={setSelectedTicket} />
              </DialogContent>
            </Dialog>
            <Button onClick={handleSignOut} variant="outline">
              Sign out
            </Button>
          </div>
        </div>

        {selectedTicket && (
          <div className="mt-8">
            <Chat ticket={selectedTicket} />
          </div>
        )}
      </div>
    </div>
  )
} 