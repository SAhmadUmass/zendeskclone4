'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(prevState: { error: string | null }, formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { error: signInError, data: { user } } = await supabase.auth.signInWithPassword(data)

    if (signInError) {
      return { error: signInError.message }
    }

    // Fetch user's role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single()

    if (profileError) {
      return { error: profileError.message }
    }

    // Check if user has appropriate role
    if (!profile?.role || !['admin', 'support'].includes(profile.role)) {
      return { error: 'Unauthorized access. Employee portal is only for admin and support staff.' }
    }

    revalidatePath('/', 'layout')

    // Redirect based on role
    if (profile.role === 'admin') {
      redirect('/admin-dashboard')
    } else {
      redirect('/support-dashboard')
    }

    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'An error occurred during login' }
  }
} 
