import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import ParentDashboardClient from './ParentDashboardClient';
import { transformDailyLogs } from '@/lib/utils';
import { Database } from '@/types/database';

export const revalidate = 30;

export default async function ParentDashboard() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();

  if (profile?.site_role !== 'parent') {
    redirect('/access-denied?reason=not-parent');
  }

  // Fetch children for this parent (server-side)
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', session.user.id)
    .eq('status', 'active');

  // Fetch recent messages for this parent
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('recipient_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Unread messages count
  const { data: unreadData, count: unreadCount } = await supabase
    .from('messages')
    .select('id', { count: 'exact' })
    .eq('recipient_id', session.user.id)
    .eq('read', false);

  // Fetch today's daily logs for this parent's children
  const today = new Date().toISOString().split('T')[0];
  const childIds = (children || []).map((c) => c.id);

  let transformedLogs: any[] = [];
  if (childIds.length > 0) {
    const { data: logs } = await supabase
      .from('daily_logs')
      .select('*')
      .in('child_id', childIds)
      .eq('date', today);

    transformedLogs = transformDailyLogs(logs || []);
  }

  return (
    // Pass server-fetched data into a client component for interactivity
    <ParentDashboardClient
      childrenData={(children || []) as Database['public']['Tables']['children']['Row'][]}
      dailyLogs={transformedLogs}
      messages={(messages || []) as any}
      unreadCount={unreadCount ?? 0}
      profile={profile ?? null}
    />
  );
}
