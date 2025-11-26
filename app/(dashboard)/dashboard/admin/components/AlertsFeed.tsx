import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function AlertsFeed() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase
    .from('alerts')
    .select('id, type, message, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Alerts</h3>
      <ul className="space-y-2">
        {(data || []).map((a) => (
          <li key={a.id} className="text-sm text-gray-700">
            <span className="font-medium">{a.type}</span>: {a.message}
          </li>
        ))}
        {!data?.length && <li className="text-sm text-gray-500">No alerts</li>}
      </ul>
    </div>
  )
}
