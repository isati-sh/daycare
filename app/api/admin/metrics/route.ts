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

    // Fetch counts
    const { count: childCount } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true })

    const { count: activeChildCount } = await supabase
      .from('children')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: teacherCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('site_role', 'teacher')

    const { count: activeTeacherCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('site_role', 'teacher')
      .eq('active_status', true)

    const { count: parentCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('site_role', 'parent')

    return NextResponse.json({
      data: {
        childCount: childCount || 0,
        activeChildCount: activeChildCount || 0,
        teacherCount: teacherCount || 0,
        activeTeacherCount: activeTeacherCount || 0,
        parentCount: parentCount || 0,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
