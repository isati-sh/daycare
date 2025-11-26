import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AttendanceSnapshot from './components/AttendanceSnapshot';
import TeacherStatus from './components/TeacherStatus';
import AlertsFeed from './components/AlertsFeed';
import SystemActivityLog from './components/SystemActivityLog';
import PendingApprovals from './components/PendingApprovals';
import QuickActions from './components/QuickActions';
import MonthlySummary from './components/MonthlySummary';

export const revalidate = 60;

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  // Session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Role enforcement
  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single();
  if (profile?.site_role !== 'admin') {
    redirect('/access-denied');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time operational overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AttendanceSnapshot />
        <TeacherStatus />
        <AlertsFeed />
        <SystemActivityLog />
        <PendingApprovals />
        <QuickActions />
        <MonthlySummary />
      </div>
    </div>
  );
}
