import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Server-only Supabase admin client. DO NOT import in client components.
// Relies on SUPABASE_SERVICE_ROLE_KEY and should only be used in server actions, API routes, or edge/server code.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)
