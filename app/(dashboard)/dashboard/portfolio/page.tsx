import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import PortfolioClient from './components/PortfolioClient';
import NoChildrenState from './components/NoChildrenState';

interface PortfolioPageProps {
  searchParams: {
    child?: string;
  };
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
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

  // Only parents can access this page (teachers/admins have their own views)
  if (role !== 'parent') {
    redirect('/access-denied?reason=not-parent');
  }

  // Fetch children - only those owned by this parent
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', session.user.id)
    .eq('status', 'active')
    .order('first_name', { ascending: true });

  if (childrenError) {
    console.error('Error fetching children:', childrenError);
    redirect('/access-denied');
  }

  // No children enrolled
  if (!children || children.length === 0) {
    return <NoChildrenState />;
  }

  // Get selected child from query param or default to first child
  const selectedChildId = searchParams.child || children[0].id;
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  // CRITICAL: Validate that selected child belongs to this parent (security check)
  if (selectedChild.parent_id !== session.user.id) {
    redirect('/access-denied');
  }

  // Fetch portfolio entries with pagination (limit to 20 most recent)
  const { data: portfolioEntries, error: portfolioError } = await supabase
    .from('portfolio_entries')
    .select('*')
    .eq('child_id', selectedChild.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(0, 19);

  if (portfolioError) {
    console.error('Error fetching portfolio entries:', portfolioError);
  }

  // Fetch development milestones
  const { data: milestones, error: milestonesError } = await supabase
    .from('development_milestones')
    .select('*')
    .eq('child_id', selectedChild.id)
    .order('achieved_date', { ascending: false });

  if (milestonesError) {
    console.error('Error fetching milestones:', milestonesError);
  }

  return (
    <PortfolioClient
      children={children}
      selectedChild={selectedChild}
      portfolioEntries={portfolioEntries || []}
      milestones={milestones || []}
    />
  );
}
