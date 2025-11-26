import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export async function requireRole(role: 'admin' | 'teacher' | 'parent') {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', user.id)
    .single()

  if (error || !data?.site_role || data.site_role !== role) {
    redirect('/access-denied')
  }
  return { user }
}