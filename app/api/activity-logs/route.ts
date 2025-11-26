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

    const { data } = await supabase
      .from('activity_logs')
      .select('id, user_id, action, target_type, target_id, timestamp')
      .order('timestamp', { ascending: false })
      .limit(50)

    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
