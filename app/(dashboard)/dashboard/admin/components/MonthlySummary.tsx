import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

export default async function MonthlySummary() {
  const supabase = createServerComponentClient({ cookies })
  const { start, end } = monthRange()

  const [meals, naps, incidents, attendance, teachersOn] = await Promise.all([
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('type', 'meal').gte('occurred_at', start).lte('occurred_at', end),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('type', 'nap').gte('occurred_at', start).lte('occurred_at', end),
    supabase.from('activities').select('*', { count: 'exact', head: true }).eq('type', 'incident').gte('occurred_at', start).lte('occurred_at', end),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).gte('date', start).lte('date', end),
    supabase.from('teacher_shifts').select('*', { count: 'exact', head: true }).gte('date', start).lte('date', end).eq('status', 'on'),
  ])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Monthly Summary</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Meals: <span className="font-semibold">{meals.count || 0}</span></div>
        <div>Naps: <span className="font-semibold">{naps.count || 0}</span></div>
        <div>Incidents: <span className="font-semibold">{incidents.count || 0}</span></div>
        <div>Attendance events: <span className="font-semibold">{attendance.count || 0}</span></div>
        <div>Teacher shift (on): <span className="font-semibold">{teachersOn.count || 0}</span></div>
      </div>
    </div>
  )
}
