import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

/**
 * Server-side Supabase admin client.
 * 
 * This file is for SERVER-SIDE admin operations only.
 * DO NOT import this in client components.
 * 
 * For client components, use: lib/supabase/client.ts -> createClient()
 * For server components, use: createServerComponentClient()
 * For server actions, use: createServerActionClient()
 * For middleware, use: createMiddlewareClient()
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

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