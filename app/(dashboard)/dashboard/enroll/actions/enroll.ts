'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

interface EnrollFormData {
  // Child Information
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age_group: 'infant' | 'toddler' | 'preschool';
  gender?: string;
  allergies?: string;
  dietary_restrictions?: string;
  medical_notes?: string;
  special_needs?: string;
  previous_daycare_experience?: string;
  preferred_nap_time?: string;
  comfort_items?: string;
  pickup_authorized_persons?: string;
  other_notes?: string;
  
  // Parent selection (for admin/teacher)
  selected_parent_id?: string;
  
  // Emergency Contacts
  emergency_contact_1_name?: string;
  emergency_contact_1_relationship?: string;
  emergency_contact_1_phone?: string;
  emergency_contact_2_name?: string;
  emergency_contact_2_relationship?: string;
  emergency_contact_2_phone?: string;
}

interface EnrollResult {
  success: boolean;
  error?: string;
  childId?: string;
}

/**
 * Sanitize string input - remove HTML, trim, limit length
 */
function sanitizeString(input: string | undefined, maxLength: number = 500): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > maxLength) {
    throw new Error(`Field exceeds maximum length of ${maxLength} characters`);
  }
  // Remove HTML tags
  const sanitized = trimmed.replace(/<[^>]*>/g, '');
  return sanitized || null;
}

/**
 * Sanitize array from comma-separated string
 */
function sanitizeArray(input: string | undefined): string[] | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  
  return trimmed
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .map(item => {
      // Sanitize each item
      const sanitized = item.replace(/<[^>]*>/g, '').substring(0, 100);
      return sanitized;
    });
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsed = new Date(date);
  const today = new Date();
  
  // Date must be in the past and not more than 10 years ago
  if (parsed >= today) return false;
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(today.getFullYear() - 10);
  if (parsed < tenYearsAgo) return false;
  
  return true;
}

export async function enrollChild(formData: EnrollFormData): Promise<EnrollResult> {
  try {
    const supabase = createServerActionClient<Database>({ cookies });
    
    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch user role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Failed to verify user role' };
    }

    const role = profile.site_role;

    // Validate required fields
    if (!formData.first_name?.trim()) {
      return { success: false, error: 'First name is required' };
    }
    if (!formData.last_name?.trim()) {
      return { success: false, error: 'Last name is required' };
    }
    if (!formData.date_of_birth) {
      return { success: false, error: 'Date of birth is required' };
    }
    if (!validateDate(formData.date_of_birth)) {
      return { success: false, error: 'Invalid date of birth format' };
    }
    if (!formData.age_group || !['infant', 'toddler', 'preschool'].includes(formData.age_group)) {
      return { success: false, error: 'Valid age group is required' };
    }
    if (!formData.gender?.trim()) {
      return { success: false, error: 'Gender is required' };
    }

    // Determine parent ID
    let parentId: string;
    
    if (role === 'admin' || role === 'teacher') {
      // Admin/teacher must select a parent
      if (!formData.selected_parent_id) {
        return { success: false, error: 'Please select a parent for this child' };
      }
      
      // Verify the selected parent exists and is active
      const { data: selectedParent, error: parentError } = await supabase
        .from('profiles')
        .select('id, site_role, active_status')
        .eq('id', formData.selected_parent_id)
        .single();

      if (parentError || !selectedParent) {
        return { success: false, error: 'Selected parent not found' };
      }
      
      if (selectedParent.site_role !== 'parent') {
        return { success: false, error: 'Selected user is not a parent' };
      }
      
      if (!selectedParent.active_status) {
        return { success: false, error: 'Selected parent is not active' };
      }
      
      parentId = formData.selected_parent_id;
    } else if (role === 'parent') {
      // Parents enroll their own children
      parentId = session.user.id;
    } else {
      return { success: false, error: 'Unauthorized role' };
    }

    // Sanitize all inputs
    const sanitizedData = {
      first_name: sanitizeString(formData.first_name, 100)!,
      last_name: sanitizeString(formData.last_name, 100)!,
      date_of_birth: formData.date_of_birth,
      age_group: formData.age_group,
      gender: sanitizeString(formData.gender, 50),
      allergies: sanitizeArray(formData.allergies),
      dietary_restrictions: sanitizeArray(formData.dietary_restrictions),
      medical_notes: sanitizeString(formData.medical_notes, 1000),
      special_needs: sanitizeString(formData.special_needs, 500),
      previous_daycare_experience: sanitizeString(formData.previous_daycare_experience, 500),
      preferred_nap_time: sanitizeString(formData.preferred_nap_time, 50),
      comfort_items: sanitizeString(formData.comfort_items, 200),
      pickup_authorized_persons: sanitizeArray(formData.pickup_authorized_persons),
      other_notes: sanitizeString(formData.other_notes, 1000),
    };

    // Insert child data
    const { data: childData, error: childError } = await supabase
      .from('children')
      .insert({
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        date_of_birth: sanitizedData.date_of_birth,
        age_group: sanitizedData.age_group,
        gender: sanitizedData.gender!,
        parent_id: parentId,
        allergies: sanitizedData.allergies,
        medical_notes: sanitizedData.medical_notes,
        status: 'pending', // Start with pending status for review
        added_by: session.user.id,
      })
      .select()
      .single();

    if (childError) {
      console.error('Error inserting child:', childError);
      return { success: false, error: 'Failed to enroll child. Please try again.' };
    }

    // Handle emergency contacts if provided
    // Note: If emergency_contacts table exists, insert there
    // Otherwise, store in emergency_contact field
    const emergencyContactText = [];
    
    if (formData.emergency_contact_1_name && formData.emergency_contact_1_phone) {
      const name = sanitizeString(formData.emergency_contact_1_name, 100);
      const phone = sanitizeString(formData.emergency_contact_1_phone, 20);
      const relationship = sanitizeString(formData.emergency_contact_1_relationship, 50);
      if (name && phone) {
        emergencyContactText.push(`${name} (${relationship || 'Contact'}): ${phone}`);
      }
    }
    
    if (formData.emergency_contact_2_name && formData.emergency_contact_2_phone) {
      const name = sanitizeString(formData.emergency_contact_2_name, 100);
      const phone = sanitizeString(formData.emergency_contact_2_phone, 20);
      const relationship = sanitizeString(formData.emergency_contact_2_relationship, 50);
      if (name && phone) {
        emergencyContactText.push(`${name} (${relationship || 'Contact'}): ${phone}`);
      }
    }

    if (emergencyContactText.length > 0) {
      const emergencyContact = emergencyContactText.join(' | ');
      await supabase
        .from('children')
        .update({ emergency_contact: emergencyContact })
        .eq('id', childData.id);
    }

    return {
      success: true,
      childId: childData.id,
    };
  } catch (error) {
    console.error('Unexpected error during enrollment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

