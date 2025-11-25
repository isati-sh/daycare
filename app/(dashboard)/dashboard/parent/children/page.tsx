import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import ChildrenClient from './ChildrenClient'
import Link from 'next/link'

export const revalidate = 30

export default async function ParentChildrenPage() {
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

  // Fetch children rows for this parent (ownership enforced server-side)
  const { data: baseChildren } = await supabase
    .from('children_with_parents')
    .select('*')
    .eq('parent_id', session.user.id)
    .eq('status', 'active')

  const childIds = (baseChildren || []).map((c: any) => c.child_id)
  let children: any[] = []

  if (childIds.length > 0) {
    const today = new Date().toISOString().split('T')[0]

    const { data: attendance } = await supabase
      .from('attendance')
      .select('child_id, status')
      .eq('date', today)
      .in('child_id', childIds)

    const { data: moods } = await supabase
      .from('daily_logs')
      .select('child_id, mood')
      .eq('date', today)
      .in('child_id', childIds)

    children = (baseChildren || []).map((row: any) => {
      const att = (attendance || []).find((a) => a.child_id === row.child_id)
      const log = (moods || []).find((l) => l.child_id === row.child_id)
      return {
        ...row,
        id: row.child_id,
        attendance_today: att?.status === 'present',
        mood_today: log?.mood ?? null,
      }
    })
  }

  return <ChildrenClient childrenData={children as any[]} />
}