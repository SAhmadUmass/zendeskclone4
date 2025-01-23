import { SupabaseClient } from '@supabase/supabase-js'
import { 
  ChatMessage, 
  FetchMessagesOptions, 
  InsertMessageParams,
  FetchMessagesResponse,
  InsertMessageResponse
} from './types'

export async function fetchMessagesByTicketId(
  supabase: SupabaseClient,
  { requestId, limit = 50, offset = 0 }: FetchMessagesOptions
): Promise<FetchMessagesResponse> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id (
          full_name
        )
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return { data: null, error: { code: error.code, message: error.message, details: error.details } }
    }

    return { data: data as ChatMessage[], error: null }
  } catch (error) {
    return { 
      data: null, 
      error: { 
        code: 'UNKNOWN_ERROR', 
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      } 
    }
  }
}

export async function insertMessage(
  supabase: SupabaseClient,
  { requestId, content }: InsertMessageParams
): Promise<InsertMessageResponse> {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { 
        data: null, 
        error: { 
          code: 'AUTH_ERROR', 
          message: userError?.message || 'User not authenticated',
          details: userError 
        } 
      }
    }

    // Get user's role from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return { 
        data: null, 
        error: { 
          code: 'PROFILE_ERROR', 
          message: 'Could not fetch user profile',
          details: profileError 
        } 
      }
    }

    // Insert the message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        request_id: requestId,
        sender_id: user.id,
        content,
        sender_type: profile.role
      })
      .select(`
        *,
        sender:profiles!sender_id (
          full_name
        )
      `)
      .single()

    if (error) {
      return { data: null, error: { code: error.code, message: error.message, details: error.details } }
    }

    return { data: data as ChatMessage, error: null }
  } catch (error) {
    return { 
      data: null, 
      error: { 
        code: 'UNKNOWN_ERROR', 
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      } 
    }
  }
} 