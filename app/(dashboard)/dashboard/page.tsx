import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export default async function DashboardRedirect() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send to login
  if (!session) {
    redirect('/login');
  }

  // Fetch user role from profiles table (not user_metadata)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();

  // If profile fetch failed or role is missing, redirect to access denied
  if (error || !profile || !profile.site_role) {
    redirect('/access-denied?reason=role-not-assigned');
  }

  const role = profile.site_role;

  // Redirect to role-specific dashboard
  redirect(`/dashboard/${role}`);
}
