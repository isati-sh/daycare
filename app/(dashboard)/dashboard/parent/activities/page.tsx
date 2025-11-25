import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import ActivitiesClient from './ActivitiesClient'

export const revalidate = 30

type PlannedActivity = Database['public']['Tables']['planned_activities']['Row'] & {
  children_participating: number
  child_name: string
}

export default async function ParentActivitiesPage({
  searchParams,
}: {
  searchParams?: { date?: string }
}) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single()

  if (profile?.site_role !== 'parent') {
    redirect('/access-denied?reason=not-parent')
  }

  const selectedDate = (searchParams?.date && /\d{4}-\d{2}-\d{2}/.test(searchParams.date))
    ? searchParams.date!
    : new Date().toISOString().split('T')[0]

  const { data: childrenData } = await supabase
    .from('children')
    .select('id, first_name, last_name, age_group')
    .eq('parent_id', session.user.id)
    .eq('status', 'active')

  const { data: activitiesData } = await supabase
    .from('planned_activities')
    .select('*')
    .eq('date', selectedDate)
    .order('start_time')

  const activities: PlannedActivity[] = (activitiesData || []).map((activity: any) => {
    const eligible = (childrenData || []).filter((child: any) => activity.age_groups?.includes(child.age_group))
    return {
      ...activity,
      children_participating: eligible.length,
      child_name: eligible.length > 0
        ? eligible.map((c: any) => `${c.first_name} ${c.last_name}`).join(', ')
        : 'No eligible children',
    }
  })

  return <ActivitiesClient activities={activities} selectedDate={selectedDate} />
}
