export type UserRole = 'admin' | 'support' | 'customer'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
} 