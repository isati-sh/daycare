import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import ReportsDashboard from './components/ReportsDashboard';
import NoChildrenState from './components/NoChildrenState';

interface ReportsPageProps {
  searchParams: {
    childId?: string;
    start?: string;
    end?: string;
  };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Not logged in → send to login
  if (!session) {
    redirect('/login');
  }

  // Fetch user role to ensure proper authorization
  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();

  const role = profile?.site_role;

  // Only parents can access this page (teachers have their own reports)
  if (role !== 'parent') {
    redirect('/access-denied');
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
  const selectedChildId = searchParams.childId || children[0].id;
  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  // Validate that selected child belongs to this parent (security check)
  if (selectedChild.parent_id !== session.user.id) {
    redirect('/access-denied');
  }

  // Date range filtering
  const startDate = searchParams.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = searchParams.end || new Date().toISOString().split('T')[0];

  // Fetch attendance records - only for this child and date range
  const { data: attendance, error: attendanceError } = await supabase
    .from('attendance')
    .select('*')
    .eq('child_id', selectedChild.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (attendanceError) {
    console.error('Error fetching attendance:', attendanceError);
  }

  // Fetch daily logs
  const { data: dailyLogs, error: logsError } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('child_id', selectedChild.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (logsError) {
    console.error('Error fetching daily logs:', logsError);
  }

  // Fetch development milestones
  const { data: milestones, error: milestonesError } = await supabase
    .from('development_milestones')
    .select('*')
    .eq('child_id', selectedChild.id)
    .gte('achieved_date', startDate)
    .lte('achieved_date', endDate)
    .order('achieved_date', { ascending: false });

  if (milestonesError) {
    console.error('Error fetching milestones:', milestonesError);
  }

  return (
    <ReportsDashboard
      children={children || []}
      selectedChild={selectedChild}
      attendance={attendance || []}
      dailyLogs={dailyLogs || []}
      milestones={milestones || []}
      startDate={startDate}
      endDate={endDate}
    />
  );
}
