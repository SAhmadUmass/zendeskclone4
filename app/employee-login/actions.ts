'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function login(prevState: { error: string | null }, formData: FormData) {
  try {
    const supabase = await createClient()

    // Authenticate user
    const { error: signInError, data: { user } } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    })

    if (signInError) {
      return { error: signInError.message }
    }

    if (!user) {
      return { error: 'Authentication failed' }
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Validate role
    if (!profile?.role || !['admin', 'support'].includes(profile.role)) {
      return { error: 'Access denied. Employee portal is for staff only.' }
    }

    // Clear cache and redirect
    revalidatePath('/', 'layout')
    redirect(profile.role === 'admin' ? '/admin-dashboard' : '/support-dashboard')
  } catch (error) {
    // Only log actual errors, not redirect "errors"
    if (!(error instanceof Error && error.message === 'NEXT_REDIRECT')) {
      console.error('Login error:', error)
    }
    throw error // Let Next.js handle redirects
  }
} 
