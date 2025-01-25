import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface BaseRecord {
  id: string | number
  created_at?: string
  [key: string]: unknown
}

type RealtimeOptions<T extends BaseRecord = BaseRecord> = {
  table: string
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void | Promise<void>
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema?: string
  filter?: string
}

export function useSupabaseRealtime<T extends BaseRecord = BaseRecord>({
  table,
  onUpdate,
  event = '*',
  schema = 'public',
  filter
}: RealtimeOptions<T>) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        // Create a channel with a unique name for this table
        const channelName = `realtime:${schema}:${table}`
        channel = supabase.channel(channelName)
        
        // Subscribe to changes using type assertion for now
        // This is safe because we know the channel supports postgres_changes
        type ChannelType = typeof channel & {
          on(event: 'postgres_changes', 
             filter: { event: string; schema: string; table: string; filter?: string },
             callback: (payload: RealtimePostgresChangesPayload<T>) => void): typeof channel
        }
        
        const subscription = (channel as ChannelType)
          .on(
            'postgres_changes',
            { event, schema, table, filter },
            (payload: RealtimePostgresChangesPayload<T>) => {
              if (onUpdate) {
                onUpdate(payload)
              }
            }
          )
          .subscribe()

        return subscription
      } catch (error) {
        console.error('Error setting up realtime subscription:', error)
      }
    }

    const subscription = setupSubscription()

    return () => {
      if (subscription) {
        subscription.then(sub => {
          if (sub) {
            supabase.removeChannel(channel)
          }
        })
      }
    }
  }, [table, event, schema, filter, onUpdate])
} 