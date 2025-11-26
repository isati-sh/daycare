import { NextResponse } from 'next/server'
import { reportCreateSchema } from '@/lib/validators/reports'
import { supabaseAdmin } from '@/lib/server/supabase-admin'

export const runtime = 'nodejs'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('reports')
    .select('*')
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = reportCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        child_id: parsed.data.child_id,
        date: parsed.data.date,
        summary: parsed.data.summary,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
