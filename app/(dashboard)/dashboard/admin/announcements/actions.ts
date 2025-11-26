'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

interface AnnouncementPayload {
  title: string
  content: string
  type: 'general' | 'event' | 'reminder' | 'emergency'
  target_audience: 'all' | 'parents' | 'teachers' | 'specific_age_group'
  age_group?: string | null
  urgency: 'low' | 'medium' | 'high' | 'urgent'
  duration_days: number
}

async function getAdminSession() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated', supabase }
  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single()
  if (!profile || profile.site_role !== 'admin') return { error: 'Not authorized', supabase }
  return { session, supabase }
}

export async function createAnnouncement(payload: AnnouncementPayload) {
  const { session, supabase, error } = await getAdminSession()
  if (error) return { error }
  if (!session) return { error: 'Not authenticated' }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + payload.duration_days)
  const userId = session.user.id

  const { error: insertError } = await supabase.from('announcements').insert({
    title: payload.title.trim(),
    content: payload.content.trim(),
    type: payload.type,
    target_audience: payload.target_audience,
    age_group: payload.target_audience === 'specific_age_group' ? payload.age_group || null : null,
    urgency: payload.urgency,
    duration_days: payload.duration_days,
    expires_at: expiresAt.toISOString(),
    is_active: true,
    created_by: userId
  })

  if (insertError) return { error: 'Failed to create announcement' }
  revalidatePath('/dashboard/admin/announcements')
  return { success: true }
}

export async function updateAnnouncement(id: string, payload: AnnouncementPayload) {
  const { session, supabase, error } = await getAdminSession()
  if (error) return { error }
  if (!session) return { error: 'Not authenticated' }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + payload.duration_days)

  const { error: updateError } = await supabase
    .from('announcements')
    .update({
      title: payload.title.trim(),
      content: payload.content.trim(),
      type: payload.type,
      target_audience: payload.target_audience,
      age_group: payload.target_audience === 'specific_age_group' ? payload.age_group || null : null,
      urgency: payload.urgency,
      duration_days: payload.duration_days,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) return { error: 'Failed to update announcement' }
  revalidatePath('/dashboard/admin/announcements')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const { supabase, error } = await getAdminSession()
  if (error) return { error }

  const { error: deleteError } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (deleteError) return { error: 'Failed to delete announcement' }
  revalidatePath('/dashboard/admin/announcements')
  return { success: true }
}

export async function toggleAnnouncement(id: string) {
  const { supabase, error } = await getAdminSession()
  if (error) return { error }

  const { data, error: fetchError } = await supabase
    .from('announcements')
    .select('is_active')
    .eq('id', id)
    .single()
  if (fetchError || !data) return { error: 'Not found' }

  const { error: updateError } = await supabase
    .from('announcements')
    .update({ is_active: !data.is_active, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) return { error: 'Failed to toggle announcement' }
  revalidatePath('/dashboard/admin/announcements')
  return { success: true }
}
