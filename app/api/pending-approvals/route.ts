import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', user.id)
      .single()

    if (profile?.site_role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { count: newTeachers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('site_role', 'teacher')
      .eq('active_status', false)

    const { count: newParents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('site_role', 'parent')
      .eq('active_status', false)

    return NextResponse.json({
      data: {
        newTeachers: newTeachers || 0,
        newParents: newParents || 0,
        profileChanges: 0,
        uploads: 0,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
