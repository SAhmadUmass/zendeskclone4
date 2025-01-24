import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type RealtimeOptions = {
  table: string
  onUpdate?: () => void | Promise<void>
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

    const setupSubscription = () => {
      channel = supabase
        .channel('table-db-changes')
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter
          },
          async () => {
            if (onUpdate) {
              await onUpdate()
            }
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        channel.unsubscribe()
      }
    }
  }, [table, event, schema, filter, onUpdate])
} 