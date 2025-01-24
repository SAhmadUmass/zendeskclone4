import { useSupabaseQuery } from './useSupabaseQuery'
import { useSupabaseRealtime } from './useSupabaseRealtime'
import { createClient } from '@/utils/supabase/client'

export type Customer = {
  id: string
  full_name: string
  email: string
  role: string
  updated_at: string
}

type UseCustomersOptions = {
  role?: string
  limit?: number
}

export function useCustomers({ role, limit }: UseCustomersOptions = {}) {
  const supabase = createClient()

  const buildQuery = () => {
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, role, updated_at')
      .order('updated_at', { ascending: false })

    if (role) {
      query = query.eq('role', role)
    }
    if (limit) {
      query = query.limit(limit)
    }

    return query
  }

  const { data: customers, loading, error } = useSupabaseQuery<Customer>({
    queryFn: buildQuery,
    dependencies: [role, limit]
  })

  // Set up real-time updates
  useSupabaseRealtime({
    table: 'profiles',
    onUpdate: () => {
      // The query will automatically re-run due to the subscription
    }
  })

  const updateCustomer = async (customer: Partial<Customer> & { id: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update(customer)
      .eq('id', customer.id)

    if (error) {
      throw new Error(error.message)
    }
  }

  return { 
    customers, 
    loading, 
    error,
    updateCustomer
  }
} 