import { NextResponse } from 'next/server'
import { z } from 'zod'
import { activityCreateSchema } from '@/lib/validators/activities'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  // Prefer RLS-backed reads via anon keys; admin client only if necessary.
  const { data, error } = await supabaseAdmin
    .from('activities')
    .select('*')
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = activityCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('activities')
      .insert({
        child_id: parsed.data.child_id,
        type: parsed.data.type,
        occurred_at: parsed.data.occurred_at,
        details: parsed.data.details ?? null,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
