import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config as appConfig } from '@/lib/config'

export const createClient = () => {
  return createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          const cookieStore = cookies()
          return cookieStore.get(name)?.value ?? ''
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookies().set({
              name,
              value,
              ...options,
              // Ensure secure cookie in production
              secure: process.env.NODE_ENV === 'production',
            })
          } catch (error) {
            // Handle cookie setting error
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookies().set({
              name,
              value: '',
              ...options,
              maxAge: 0
            })
          } catch (error) {
            // Handle cookie deletion error
            console.error('Error deleting cookie:', error)
          }
        },
      },
    }
  )
} 