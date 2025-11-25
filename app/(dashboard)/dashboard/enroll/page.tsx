import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import EnrollForm from './components/EnrollForm';

export default async function EnrollPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send to login
  if (!session) {
    redirect('/login');
  }

  // Fetch user role to ensure proper authorization
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();

  if (profileError || !profile) {
    redirect('/access-denied');
  }

  const role = profile.site_role;

  // Only parents, admins, and teachers can access this page
  if (role !== 'parent' && role !== 'admin' && role !== 'teacher') {
    redirect('/access-denied?reason=not-authorized');
  }

  // If admin or teacher, fetch active parents for selection
  let activeParents: Array<{ id: string; full_name: string; email: string }> = [];
  
  if (role === 'admin' || role === 'teacher') {
    const { data: parents, error: parentsError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('site_role', 'parent')
      .eq('active_status', true)
      .order('full_name', { ascending: true });

    if (!parentsError && parents) {
      activeParents = parents.map(p => ({
        id: p.id,
        full_name: p.full_name || 'Unknown',
        email: p.email,
      }));
    }
  }

  return <EnrollForm userRole={role} activeParents={activeParents} />;
}
