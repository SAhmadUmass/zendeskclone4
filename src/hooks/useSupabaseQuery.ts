import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

type QueryOptions<T> = {
  queryFn: () => PostgrestFilterBuilder<any, any, T[], any, any>
  dependencies?: unknown[]
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const query = queryFn()
      const { data: result, error: queryError } = await query

      if (queryError) {
        throw new Error(queryError.message)
      }

      if (result) {
        setData(result)
        onSuccess?.(result)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      onError?.(err as Error)
    } finally {
      setLoading(false)
    }
  }, [queryFn, onSuccess, onError])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const execute = async () => {
      if (!isMounted) return
      await fetchData()
    }

    execute()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [fetchData, ...dependencies])

  return { data, loading, error }
} 