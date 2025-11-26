import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function AttendanceSnapshot() {
  const supabase = createServerComponentClient({ cookies })
  const today = new Date().toISOString().split('T')[0]

  const [total, checkedIn, checkedOut, absent] = await Promise.all([
    supabase.from('children').select('*', { count: 'exact', head: true }),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'in'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'out'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'absent'),
  ])

  const totalCount = total.count || 0
  const checkedInCount = checkedIn.count || 0
  const checkedOutCount = checkedOut.count || 0
  const absentCount = absent.count || 0

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Attendance Snapshot</h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-lg font-semibold">{totalCount}</div>
        </div>
        <div>
          <div className="text-sm text-green-600">Checked-in</div>
          <div className="text-lg font-semibold">{checkedInCount}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Checked-out</div>
          <div className="text-lg font-semibold">{checkedOutCount}</div>
        </div>
        <div>
          <div className="text-sm text-red-600">Absent</div>
          <div className="text-lg font-semibold">{absentCount}</div>
        </div>
      </div>
    </div>
  )
}
