'use client';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

// Core sign-out logic
async function performSignOut(redirectTo: string = '/login') {
  try {
    const supabase = createClient();

    // Clear all browser storage to ensure a clean state
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();

      // Aggressively clear cookies
      document.cookie.split(';').forEach(c => {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
      });
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase sign out error:', error);
      toast.error('An error occurred during sign out.');
    }

  } catch (error) {
    console.error('Error during sign out process:', error);
    toast.error('An unexpected error occurred.');
  } finally {
    // Always redirect and reload to ensure a clean state
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
}

/**
 * Custom hook to handle user sign out.
 * @returns Object containing the signOut function.
 */
export function useSignOut() {
  const signOut = async (redirectTo?: string) => {
    await performSignOut(redirectTo);
  };

  return { signOut };
}

/**
 * Utility function to sign out without using the hook.
 * Useful for non-React components or when you can't use hooks.
 */
export async function handleSignOut(redirectTo?: string) {
  await performSignOut(redirectTo);
}

export default useSignOut;
