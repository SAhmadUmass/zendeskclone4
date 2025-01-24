import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

type QueryOptions<T> = {
  queryFn: () => PostgrestFilterBuilder<any, any, T[]>
  dependencies?: any[]
  onSuccess?: (data: T[]) => void
  onError?: (error: Error) => void
}

export function useSupabaseQuery<T>({ 
  queryFn, 
  dependencies = [], 
  onSuccess, 
  onError 
}: QueryOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const query = queryFn()
        const { data: result, error: queryError } = await query

        if (queryError) {
          throw new Error(queryError.message)
        }

        if (result && isMounted) {
          setData(result)
          onSuccess?.(result)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        if (isMounted) {
          setError(message)
          onError?.(err as Error)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [...dependencies])

  return { data, loading, error }
} 