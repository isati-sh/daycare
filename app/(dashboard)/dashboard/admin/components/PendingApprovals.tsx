import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function PendingApprovals() {
  const supabase = createServerComponentClient({ cookies })
  const [{ count: newTeachers = 0 }, { count: newParents = 0 }, { count: profileChanges = 0 }, { count: uploads = 0 }, { count: parentNotes = 0 }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('site_role', 'teacher').eq('active_status', false),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('site_role', 'parent').eq('active_status', false),
    supabase.from('profile_change_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('parent_notes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-medium mb-2">Pending Approvals</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>New Teachers: <span className="font-semibold">{newTeachers}</span></div>
        <div>New Parents: <span className="font-semibold">{newParents}</span></div>
        <div>Profile Changes: <span className="font-semibold">{profileChanges}</span></div>
        <div>Uploads: <span className="font-semibold">{uploads}</span></div>
        <div>Parent Notes: <span className="font-semibold">{parentNotes}</span></div>
      </div>
    </div>
  )
}
