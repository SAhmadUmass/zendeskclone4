import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config as appConfig } from '@/lib/config'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? ''
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ 
            name, 
            value, 
            ...options,
            // Ensure secure cookie in production
            secure: process.env.NODE_ENV === 'production',
          })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name)
        },
      },
    }
  )
} 