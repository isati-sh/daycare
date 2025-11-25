import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'
import DailyLogsClient from './DailyLogsClient'
import { formatDailyLogsForClient } from '@/lib/formatDailyLog'

export const revalidate = 30

type PageProps = {
  searchParams?: {
    date?: string
    month?: string
  }
}

export default async function ParentDailyLogsPage({ searchParams }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single()

  if (profile?.site_role !== 'parent') {
    redirect('/access-denied?reason=not-parent')
  }

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', session.user.id)
    .eq('status', 'active')

  const childIds = (children || []).map((c) => c.id)
  let logs: any[] = []

  if (childIds.length > 0) {
    const today = new Date()
    const dateParam = searchParams?.date
    const monthParam = searchParams?.month

    let gteDate: string | undefined
    let lteDate: string | undefined

    if (dateParam) {
      gteDate = dateParam
      lteDate = dateParam
    } else if (monthParam) {
      const first = new Date(`${monthParam}-01T00:00:00`)
      const last = new Date(first)
      last.setMonth(first.getMonth() + 1)
      last.setDate(0)
      gteDate = first.toISOString().split('T')[0]
      lteDate = last.toISOString().split('T')[0]
    } else {
      const past30 = new Date(today)
      past30.setDate(today.getDate() - 30)
      gteDate = past30.toISOString().split('T')[0]
    }

    let query = supabase
      .from('daily_logs')
      .select('*')
      .in('child_id', childIds)
      .order('date', { ascending: false })
      .limit(30)

    if (gteDate && lteDate) {
      query = query.gte('date', gteDate).lte('date', lteDate)
    } else if (gteDate) {
      query = query.gte('date', gteDate)
    }

    const { data: logsData } = await query
    logs = logsData || []

    // Sign photo URLs securely (1 hour)
    const signForLog = async (paths: string[] | null | undefined) => {
      if (!paths || paths.length === 0) return [] as string[]
      const out: string[] = []
      for (const p of paths) {
        const { data: signed } = await supabase.storage
          .from('daily_photos')
          .createSignedUrl(p, 3600)
        if (signed?.signedUrl) out.push(signed.signedUrl)
      }
      return out
    }

    // Attach signed photos and format structure
    const processed = [] as any[]
    for (const log of logs) {
      const signedPhotos = await signForLog(log.photos as any)
      processed.push({ ...log, photos: signedPhotos })
    }
    logs = formatDailyLogsForClient(processed)
  }

  return (
    <DailyLogsClient
      childrenData={(children || []) as Database['public']['Tables']['children']['Row'][]}
      logs={logs}
    />
  )
}
