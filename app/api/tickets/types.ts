export type TicketStatus = 'open' | 'in_progress' | 'resolved'
export type TicketPriority = 'low' | 'medium' | 'high'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  customer_id: string
  agent_id?: string
  created_at: string
  updated_at: string
}

export interface TicketCreate {
  title: string
  description: string
  priority: TicketPriority
}

export interface TicketUpdate extends Partial<TicketCreate> {
  status?: TicketStatus
}

export const isValidStatus = (status: unknown): status is TicketStatus => {
  return ['open', 'in_progress', 'resolved'].includes(status as string)
}

export const isValidPriority = (priority: unknown): priority is TicketPriority => {
  return ['low', 'medium', 'high'].includes(priority as string)
}

export const validateTicketCreate = (data: unknown): { valid: boolean; error?: string } => {
  const ticketData = data as Partial<TicketCreate>
  if (!ticketData.title || typeof ticketData.title !== 'string') {
    return { valid: false, error: 'Title is required and must be a string' }
  }
  if (!ticketData.description || typeof ticketData.description !== 'string') {
    return { valid: false, error: 'Description is required and must be a string' }
  }
  if (!ticketData.priority || !isValidPriority(ticketData.priority)) {
    return { valid: false, error: 'Valid priority (low, medium, high) is required' }
  }
  return { valid: true }
}

export const validateTicketUpdate = (data: unknown): { valid: boolean; error?: string } => {
  const ticketData = data as Partial<TicketUpdate>
  if (ticketData.title && typeof ticketData.title !== 'string') {
    return { valid: false, error: 'Title must be a string' }
  }
  if (ticketData.description && typeof ticketData.description !== 'string') {
    return { valid: false, error: 'Description must be a string' }
  }
  if (ticketData.priority && !isValidPriority(ticketData.priority)) {
    return { valid: false, error: 'Priority must be low, medium, or high' }
  }
  if (ticketData.status && !isValidStatus(ticketData.status)) {
    return { valid: false, error: 'Status must be open, in_progress, or resolved' }
  }
  return { valid: true }
} 