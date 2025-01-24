import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config as appConfig } from '@/lib/config'
import { CookieOptions } from '@supabase/ssr'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    appConfig.supabase.url,
    appConfig.supabase.anonKey,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get(name)
          return cookie?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          })
        },
      },
    }
  )
} 