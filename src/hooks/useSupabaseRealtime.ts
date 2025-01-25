import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type RealtimeOptions = {
  table: string
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void | Promise<void>
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  schema?: string
  filter?: string
}

export function useSupabaseRealtime({
  table,
  onUpdate,
  event = '*',
  schema = 'public',
  filter
}: RealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        channel = supabase.channel('schema-db-changes', {
          config: {
            postgres_changes: {
              event: event,
              schema: schema,
              table: table,
              filter: filter
            }
          }
        })
        
        const subscription = channel
          .on(
            'postgres_changes',
            {
              event: event,
              schema: schema,
              table: table,
              filter: filter
            },
            (payload: RealtimePostgresChangesPayload<any>) => {
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