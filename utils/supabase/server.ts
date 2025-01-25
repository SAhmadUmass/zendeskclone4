import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config as appConfig } from '@/lib/config'

export const runtime = 'edge'

export const createClient = async () => {
  return createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          const cookie = cookieStore.get(name)
          return cookie?.value ?? ''
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({
            name,
            value,
            ...options,
            secure: process.env.NODE_ENV === 'production',
          })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0
          })
        },
      },
    }
  )
} 