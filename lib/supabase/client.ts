'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

/**
 * Centralized Supabase client for client components.
 * 
 * This function ensures all client-side code uses the same client instance pattern,
 * preventing multiple GoTrueClient instances and session conflicts.
 * 
 * IMPORTANT: Only use this in client components ('use client').
 * For server components, use createServerComponentClient().
 * For server actions, use createServerActionClient().
 * For middleware, use createMiddlewareClient().
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

