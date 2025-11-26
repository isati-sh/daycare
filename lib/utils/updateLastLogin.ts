'use client'

import { createClient } from '@/lib/supabase/client'

export async function updateLastLogin(userId: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        last_login: new Date().toISOString() 
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating last login:', error)
    }
  } catch (error) {
    console.error('Error updating last login:', error)
  }
}
