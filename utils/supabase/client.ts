import { createBrowserClient } from '@supabase/ssr'
import { config as appConfig } from '@/lib/config'

export const createClient = () => {
  return createBrowserClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey
  )
} 