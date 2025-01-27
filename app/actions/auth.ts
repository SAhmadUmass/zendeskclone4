'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function signOut() {
  try {
    const supabase = await createClient()
    
    // Check if user is logged in first
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }

    // Clear cache and redirect to root page where users can choose login type
    revalidatePath('/', 'layout')
    redirect('/')
  } catch (error) {
    console.error('Error signing out:', error)
    // Still redirect to root page even if there's an error
    redirect('/')
  }
} 
