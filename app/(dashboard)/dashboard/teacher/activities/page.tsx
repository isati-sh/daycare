import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import ActivitiesClient from './ActivitiesClient';

export const revalidate = 30;

type PlannedActivity = Database['public']['Tables']['planned_activities']['Row'] & {
  children_participating: number;
};

export default async function TeacherActivitiesPage({
  searchParams,
}: {
  searchParams?: { date?: string };
}) {
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

  if (profile?.site_role !== 'teacher') {
    redirect('/access-denied?reason=not-teacher');
  }

  const selectedDate =
    searchParams?.date && /\d{4}-\d{2}-\d{2}/.test(searchParams.date)
      ? searchParams.date
      : new Date().toISOString().split('T')[0];

  // Fetch only activities created by this teacher
  const { data: activitiesData } = await supabase
    .from('planned_activities')
    .select('*')
    .eq('date', selectedDate)
    .eq('created_by', session.user.id)
    .order('start_time')
    .limit(50);

  // Fetch children assigned to this teacher
  const { data: childrenData } = await supabase
    .from('children')
    .select('id, age_group')
    .eq('teacher_id', session.user.id)
    .eq('status', 'active');

  // Calculate participation for each activity
  const activities: PlannedActivity[] = (activitiesData || []).map((activity: any) => {
    const eligible = (childrenData || []).filter((child: any) =>
      activity.age_groups?.includes(child.age_group)
    );
    return {
      ...activity,
      children_participating: eligible.length,
    };
  });

  return <ActivitiesClient activities={activities} selectedDate={selectedDate} />;
}
