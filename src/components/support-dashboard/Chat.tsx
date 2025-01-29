'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

interface Message {
  id: string
  content: string
  sender_id: string
  sender_type: 'customer' | 'support'
  created_at: string
  profiles: {
    full_name: string | null
  } | null
}

interface ChatProps {
  ticketId: string
  customerName: string
  ticketTitle: string
}

export function Chat({ ticketId, customerName, ticketTitle }: ChatProps) {
  const [message, setMessage] = React.useState("")
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Add useEffect for scrolling when messages change
  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch initial messages
  React.useEffect(() => {
    async function fetchMessages() {
      try {
        setIsLoading(true)
        setError(null)

        // Get messages with profiles in a single query
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            profiles:sender_id (
              id,
              full_name
            )
          `)
          .eq('request_id', ticketId)
          .order('created_at', { ascending: true })

        if (messagesError) throw messagesError

        // Transform the data to match our Message interface
        const transformedMessages = messagesData?.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          sender_type: msg.sender_type,
          created_at: msg.created_at,
          profiles: msg.profiles || { full_name: 'Unknown User' }
        })) || []

        setMessages(transformedMessages)
      } catch (err) {
        setError('Failed to load messages')
        console.error('Error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel(`messages:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `request_id=eq.${ticketId}`
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT') {
              const { data: newMessage, error: messageError } = await supabase
                .from('messages')
                .select(`
                  *,
                  profiles:sender_id (
                    id,
                    full_name
                  )
                `)
                .eq('id', payload.new.id)
                .single()

              if (messageError) throw messageError

              setMessages(prev => [...prev, {
                ...newMessage,
                profiles: newMessage.profiles || { full_name: 'Unknown User' }
              }])
            } else if (payload.eventType === 'DELETE') {
              setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
            } else if (payload.eventType === 'UPDATE') {
              const { data: updatedMessage, error: messageError } = await supabase
                .from('messages')
                .select(`
                  *,
                  profiles:sender_id (
                    id,
                    full_name
                  )
                `)
                .eq('id', payload.new.id)
                .single()

              if (messageError) throw messageError

              setMessages(prev => 
                prev.map(msg => 
                  msg.id === payload.new.id ? {
                    ...updatedMessage,
                    profiles: updatedMessage.profiles || { full_name: 'Unknown User' }
                  } : msg
                )
              )
            }
          } catch (error) {
            console.error('Realtime subscription error:', error)
            setError(error instanceof Error ? error.message : 'Failed to process realtime update')
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to realtime updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to realtime updates:', err)
          setError('Failed to connect to realtime updates')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [ticketId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    try {
      // Get session and check user authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError('Authentication error')
        return
      }
      
      if (!session?.user?.id) {
        setError('You must be logged in to send messages')
        return
      }

      // Check if user has support role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Failed to verify support role')
        return
      }

      if (profile?.role !== 'support') {
        setError('Only support staff can send messages')
        return
      }

      // Send the message
      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          content: message.trim(),
          request_id: ticketId,
          sender_type: 'support',
          sender_id: session.user.id
        })

      if (sendError) {
        console.error('Send error:', sendError)
        throw sendError
      }

      setMessage("")
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message')
    }
  }

  if (isLoading) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <p>Loading messages...</p>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-[400px]">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Chat with {customerName}</h3>
        <p className="text-sm text-muted-foreground">
          Ticket: {ticketTitle}
        </p>
      </div>
      
      {error && (
        <div className="p-2 text-sm text-red-500 bg-red-50">
          {error}
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.sender_type === 'support' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar>
                <AvatarFallback>
                  {msg.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`flex-1 px-4 py-2 rounded-lg ${
                msg.sender_type === 'support' ? 'bg-primary text-primary-foreground ml-2' : 'bg-muted mr-2'
              }`}>
                <p className="text-xs font-medium mb-1">
                  {msg.profiles?.full_name || 'Unknown User'}
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