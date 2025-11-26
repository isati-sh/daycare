import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs'

export async function GET() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ authenticated: false }, { status: 200 })
  return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } })
}
