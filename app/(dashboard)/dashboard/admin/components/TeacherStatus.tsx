import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function TeacherStatus() {
  const supabase = createServerComponentClient({ cookies })
  const today = new Date().toISOString().split('T')[0]

  const [{ count: teachersOn = 0 }, { count: teachersOff = 0 }, { count: childrenTotal = 0 }] = await Promise.all([
    supabase.from('teacher_shifts').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'on'),
    supabase.from('teacher_shifts').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'off'),
    supabase.from('children').select('*', { count: 'exact', head: true }),
  ])

  const ratio = childrenTotal && teachersOn ? (childrenTotal / teachersOn).toFixed(1) : '—'

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Teacher Status</h3>
      <div className="flex justify-between text-center">
        <div>
          <div className="text-sm text-green-600">On Shift</div>
          <div className="text-lg font-semibold">{teachersOn}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Off Duty</div>
          <div className="text-lg font-semibold">{teachersOff}</div>
        </div>
        <div>
          <div className="text-sm text-indigo-600">Ratio</div>
          <div className="text-lg font-semibold">{ratio}</div>
        </div>
      </div>
    </div>
  )
}
