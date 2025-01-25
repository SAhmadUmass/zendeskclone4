import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export type Customer = {
  id: string
  full_name: string
  email: string
  role: 'customer' | 'support' | 'admin'
  created_at: string
  requests_count?: number
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      setLoading(true)
      setError(null)

      // First verify auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Auth session error:', sessionError)
        setError('Authentication error')
        router.push('/login')
        return
      }

      if (!session) {
        console.error('No session found')
        setError('No active session')
        router.push('/login')
        return
      }

      // Get user's profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        setError('Could not fetch user profile')
        return
      }

      if (!profile) {
        console.error('No profile found for user:', session.user.id)
        setError('User profile not found')
        return
      }

      // Only support and admin can view customer list
      if (profile.role !== 'support' && profile.role !== 'admin') {
        setError('Unauthorized to view customers')
        return
      }

      const { data, error: customersError } = await supabase
        .from('profiles')
        .select(`
          *,
          requests:requests (count)
        `)
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (customersError) {
        console.error('Error details:', customersError)
        throw customersError
      }

      // Transform the data to include the requests count
      const customersWithCounts = data?.map(customer => ({
        ...customer,
        requests_count: customer.requests?.[0]?.count || 0
      })) || []

      setCustomers(customersWithCounts)
    } catch (err) {
      setError('Failed to fetch customers')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateCustomer(customer: Customer) {
    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: customer.full_name,
          email: customer.email,
          role: customer.role
        })
        .eq('id', customer.id)

      if (updateError) {
        console.error('Error details:', updateError)
        throw updateError
      }

      // Refresh the customers list
      await fetchCustomers()
    } catch (err) {
      setError('Failed to update customer')
      console.error('Error updating customer:', err)
      throw err
    }
  }

  return { customers, loading, error, updateCustomer }
} 
