'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { User } from '@/types/users'

interface UsersRealtimeProps {
  initialUsers: User[]
  onUserUpdate: (user: User) => void
}

export function UsersRealtime({ initialUsers, onUserUpdate }: UsersRealtimeProps) {
  const supabase = createClient()

  useEffect(() => {
    // Set up realtime subscription for user updates
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.support'
        },
        (payload: RealtimePostgresChangesPayload<User>) => {
          if (payload.new && payload.eventType === 'UPDATE') {
            onUserUpdate(payload.new)
          }
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [supabase, onUserUpdate])

  return null // This is a logic-only component
} 

