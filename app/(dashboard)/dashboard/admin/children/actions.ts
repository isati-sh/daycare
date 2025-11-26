'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'

const VALID_AGE_GROUPS = ['infant','toddler','preschool'] as const
const VALID_STATUS = ['active','inactive','waitlist'] as const

type AgeGroup = typeof VALID_AGE_GROUPS[number]
type Status = typeof VALID_STATUS[number]

function normalizeAllergies(input: string): string[] | null {
  if (!input.trim()) return null
  const parts = input
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 0)
  const unique = Array.from(new Set(parts))
  return unique.length ? unique : null
}

async function requireAdmin() {
  const supabase = createServerActionClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'Not authenticated', supabase }
  const { data: profile } = await supabase
    .from('profiles')
    .select('site_role')
    .eq('id', session.user.id)
    .single()
  if (!profile || profile.site_role !== 'admin') return { error: 'Not authorized', supabase }
  return { supabase, session }
}

interface ChildPayload {
  first_name: string
  last_name: string
  date_of_birth: string
  age_group: AgeGroup
  parent_email?: string
  parent_name?: string
  teacher_id?: string | null
  allergies?: string
  medical_notes?: string
  emergency_contact?: string
  status: Status
}

function validateChild(p: ChildPayload): string | null {
  if (!p.first_name.trim()) return 'First name required'
  if (!p.last_name.trim()) return 'Last name required'
  if (!/\d{4}-\d{2}-\d{2}/.test(p.date_of_birth)) return 'Invalid date_of_birth format'
  const dob = new Date(p.date_of_birth)
  if (dob > new Date()) return 'Date of birth cannot be in future'
  if (!VALID_AGE_GROUPS.includes(p.age_group)) return 'Invalid age group'
  if (!VALID_STATUS.includes(p.status)) return 'Invalid status'
  return null
}

export async function addChild(payload: ChildPayload) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }
  const vErr = validateChild(payload)
  if (vErr) return { error: vErr }

  // Resolve / create parent if email provided
  let parentId: string | null = null
  if (payload.parent_email) {
    const { data: existingParent } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', payload.parent_email)
      .single()
    if (existingParent) {
      parentId = existingParent.id
    } else if (payload.parent_name) {
      const { data: newParent, error: parentError } = await supabase
        .from('profiles')
        .insert({ email: payload.parent_email, full_name: payload.parent_name, site_role: 'parent' })
        .select('id')
        .single()
      if (parentError || !newParent) return { error: 'Failed creating parent profile' }
      parentId = newParent.id
    } else {
      return { error: 'Parent name required when creating new parent' }
    }
  }

  // Validate teacher if provided
  let teacherId: string | null = null
  if (payload.teacher_id) {
    const { data: teacher } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', payload.teacher_id)
      .eq('site_role', 'teacher')
      .single()
    if (teacher) teacherId = teacher.id
    else return { error: 'Invalid teacher_id' }
  }

  const allergies = normalizeAllergies(payload.allergies || '')

  const { error: insertError } = await supabase.from('children').insert({
    first_name: payload.first_name.trim(),
    last_name: payload.last_name.trim(),
    date_of_birth: payload.date_of_birth,
    age_group: payload.age_group,
    parent_id: parentId,
    teacher_id: teacherId,
    allergies,
    medical_notes: payload.medical_notes?.trim() || null,
    emergency_contact: payload.emergency_contact?.trim() || null,
    status: payload.status,
    enrollment_date: new Date().toISOString().split('T')[0]
  })
  if (insertError) return { error: 'Failed to add child' }
  revalidatePath('/dashboard/admin/children')
  return { success: true }
}

export async function updateChild(id: string, payload: Partial<ChildPayload>) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }
  if (!id) return { error: 'Missing child id' }

  // Fetch existing child for merges
  const { data: existing, error: fetchError } = await supabase
    .from('children')
    .select('id, parent_id')
    .eq('id', id)
    .single()
  if (fetchError || !existing) return { error: 'Child not found' }

  const update: any = {}
  if (payload.first_name) update.first_name = payload.first_name.trim()
  if (payload.last_name) update.last_name = payload.last_name.trim()
  if (payload.date_of_birth) {
    if (!/\d{4}-\d{2}-\d{2}/.test(payload.date_of_birth)) return { error: 'Invalid date_of_birth' }
    update.date_of_birth = payload.date_of_birth
  }
  if (payload.age_group) {
    if (!VALID_AGE_GROUPS.includes(payload.age_group)) return { error: 'Invalid age group' }
    update.age_group = payload.age_group
  }
  if (payload.status) {
    if (!VALID_STATUS.includes(payload.status)) return { error: 'Invalid status' }
    update.status = payload.status
  }
  if (payload.allergies !== undefined) update.allergies = normalizeAllergies(payload.allergies)
  if (payload.medical_notes !== undefined) update.medical_notes = payload.medical_notes?.trim() || null
  if (payload.emergency_contact !== undefined) update.emergency_contact = payload.emergency_contact?.trim() || null

  if (payload.teacher_id !== undefined) {
    if (payload.teacher_id === null || payload.teacher_id === '') {
      update.teacher_id = null
    } else {
      const { data: teacher } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', payload.teacher_id)
        .eq('site_role', 'teacher')
        .single()
      if (!teacher) return { error: 'Invalid teacher assignment' }
      update.teacher_id = teacher.id
    }
  }

  const { error: updError } = await supabase
    .from('children')
    .update(update)
    .eq('id', id)
  if (updError) return { error: 'Failed updating child' }
  revalidatePath('/dashboard/admin/children')
  return { success: true }
}

export async function deleteChild(id: string) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }
  if (!id) return { error: 'Missing id' }
  const { error: delError } = await supabase
    .from('children')
    .delete()
    .eq('id', id)
  if (delError) return { error: 'Failed deleting child' }
  revalidatePath('/dashboard/admin/children')
  return { success: true }
}

export async function assignTeacher(childId: string, teacherId: string | null) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }
  if (!childId) return { error: 'Missing childId' }
  let resolved: string | null = null
  if (teacherId) {
    const { data: teacher } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', teacherId)
      .eq('site_role', 'teacher')
      .single()
    if (!teacher) return { error: 'Invalid teacher' }
    resolved = teacher.id
  }
  const { error: updError } = await supabase
    .from('children')
    .update({ teacher_id: resolved })
    .eq('id', childId)
  if (updError) return { error: 'Failed assigning teacher' }
  revalidatePath('/dashboard/admin/children')
  return { success: true }
}

export async function updateStatus(childId: string, status: Status) {
  const { supabase, error } = await requireAdmin()
  if (error) return { error }
  if (!VALID_STATUS.includes(status)) return { error: 'Invalid status' }
  const { error: updError } = await supabase
    .from('children')
    .update({ status })
    .eq('id', childId)
  if (updError) return { error: 'Failed updating status' }
  revalidatePath('/dashboard/admin/children')
  return { success: true }
}
