import { createBrowserClient } from '@supabase/ssr'

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
    throw new Error('Missing SUPABASE_URL')
  }
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Missing SUPABASE_ANON_KEY')
  }
  return key
}

export const createClient = () => {
  try {
    const client = createBrowserClient(
      getSupabaseUrl(),
      getSupabaseAnonKey()
    )
    return client
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    throw error
  }
} 