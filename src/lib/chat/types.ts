export interface ChatMessage {
  id: string
  request_id: string
  sender_id: string
  content: string
  created_at: string
  sender_type: string
  sender?: {
    full_name: string
  }
}

export interface FetchMessagesOptions {
  requestId: string
  limit?: number
  offset?: number
}

export interface InsertMessageParams {
  requestId: string
  content: string
}

export type ChatError = {
  code: string
  message: string
  details?: unknown
}

// Response types
export type FetchMessagesResponse = {
  data: ChatMessage[] | null
  error: ChatError | null
}

export type InsertMessageResponse = {
  data: ChatMessage | null
  error: ChatError | null
} 