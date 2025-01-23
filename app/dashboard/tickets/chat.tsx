'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { Ticket } from "./columns"
import { createClient } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  sender_id: string
  sender_type: 'customer' | 'support'
  created_at: string
  profiles: {
    full_name: string
  }
}

interface ChatProps {
  ticket: Ticket
}

export function Chat({ ticket }: ChatProps) {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch initial messages
  React.useEffect(() => {
    async function fetchMessages() {
      // Debug session state
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Debug - Session:', {
        exists: !!session,
        error: null,
        userId: session?.user?.id,
        role: session?.user?.user_metadata?.role
      })

      // First, verify we can access the ticket
      const ticketCheck = await supabase
        .from('requests')
        .select('id')
        .eq('id', ticket.id)
        .single()
      
      console.log('Debug - Ticket Access:', {
        success: !ticketCheck.error,
        error: ticketCheck.error,
        ticketId: ticket.id
      })

      if (ticketCheck.error) {
        console.error('No permission to access this ticket')
        return
      }

      // Now fetch messages in two steps
      // 1. Get messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('request_id', ticket.id)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return
      }

      // 2. Get profiles for these messages
      const senderIds = [...new Set(messagesData.map(m => m.sender_id))]
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', senderIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
        return
      }

      // Create a map of profiles
      const profileMap = new Map(
        profilesData.map(p => [p.id, p])
      )

      // Combine the data
      const transformedMessages = messagesData.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_type: msg.sender_type,
        created_at: msg.created_at,
        profiles: profileMap.get(msg.sender_id) || { full_name: 'Unknown' }
      }))

      setMessages(transformedMessages)
    }

    fetchMessages()

    // Modify the realtime subscription handler too
    const channel = supabase
      .channel(`messages:${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${ticket.id}`
        },
        async (payload) => {
          // Fetch both message and profile
          const [messageRes, profileRes] = await Promise.all([
            supabase
              .from('messages')
              .select('*')
              .eq('id', payload.new.id)
              .single(),
            supabase
              .from('profiles')
              .select('id, full_name')
              .eq('id', payload.new.sender_id)
              .single()
          ])

          if (!messageRes.error && !profileRes.error) {
            const newMessage = {
              ...messageRes.data,
              profiles: profileRes.data
            }
            setMessages(prev => [...prev, newMessage])
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [ticket.id, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Debug - Check session before sending
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Debug - Send Message Session:', {
      exists: !!session,
      userId: session?.user?.id
    })

    if (!session?.user?.id) {
      console.error('No authenticated user')
      return
    }

    const { error } = await supabase
      .from('messages')
      .insert({
        content: message.trim(),
        request_id: ticket.id,
        sender_type: 'customer',
        sender_id: session.user.id // Add sender_id
      })

    if (error) {
      console.error('Error sending message:', error)
      return
    }

    setMessage("")
  }

  return (
    <Card className="flex flex-col h-[400px] mt-8">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat with Agent</h3>
        <p className="text-sm text-muted-foreground">
          Ticket: {ticket.title}
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className="flex items-start gap-2"
            >
              <Avatar>
                <AvatarFallback>
                  {msg.profiles.full_name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`rounded-lg p-3 ${
                msg.sender_type === 'customer' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-xs font-medium mb-1">
                  {msg.profiles.full_name}
                </p>
                <p className="text-sm">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
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
  )
} 