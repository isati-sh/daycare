import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function SystemActivityLog() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase
    .from('activity_logs')
    .select('id, user_id, action, target_type, target_id, timestamp')
    .order('timestamp', { ascending: false })
    .limit(10)

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">System Activity</h3>
      <ul className="space-y-2">
        {(data || []).map((l) => (
          <li key={l.id} className="text-sm text-gray-700">
            {l.action} → {l.target_type} ({new Date(l.timestamp).toLocaleString()})
          </li>
        ))}
        {!data?.length && <li className="text-sm text-gray-500">No activity</li>}
      </ul>
    </div>
  )
}
