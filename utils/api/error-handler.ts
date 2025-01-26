import { PostgrestError } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export type ApiError = {
  status: number
  message: string
}

export function handleApiError(error: unknown, notFoundMessage = 'Not found'): Response {
  console.error('API error:', error)
  
  if (error instanceof PostgrestError) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: notFoundMessage },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const message = error instanceof Error ? error.message : 'Internal Server Error'
  return NextResponse.json(
    { error: message },
    { status: 500 }
  )
} 