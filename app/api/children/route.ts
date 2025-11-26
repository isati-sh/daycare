import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase-admin'
import { z } from 'zod'

export const runtime = 'nodejs'

const CreateChildSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  date_of_birth: z.string(),
  parent_id: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = CreateChildSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Server-only privileged operation (if needed), otherwise rely on RLS
    const { data, error } = await supabaseAdmin
      .from('children')
      .insert({
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        date_of_birth: parsed.data.date_of_birth,
        parent_id: parsed.data.parent_id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
