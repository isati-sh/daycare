import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    }
  }
)

export const supabaseAdmin = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Function to get user profile with role
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return { data, error }
}

// Function to get the appropriate Supabase client based on user role
export async function getSupabaseClient() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return supabase
  }

  // Check user's role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', user.id)
    .single()

  // Return admin client for admin users, regular client for others
  return profile?.site_role === 'admin' ? supabaseAdmin : supabase
}

// Synchronous function to get client based on known role
export const getClientByRole = (role?: 'parent' | 'teacher' | 'admin') => {
  return role === 'admin' ? supabaseAdmin : supabase
} 