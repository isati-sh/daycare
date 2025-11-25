'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import { revalidatePath } from 'next/cache';

export async function updateParentProfile(formData: {
  full_name: string;
  phone: string;
  address: string;
  emergency_contact: string;
}) {
  try {
    const supabase = createServerActionClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'parent') {
      return { error: 'Access denied' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        emergency_contact: formData.emergency_contact.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Profile update error:', error);
      return { error: 'Failed to update profile' };
    }

    revalidatePath('/dashboard/parent/profile');
    return { success: true };
  } catch (error) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateParentPassword(newPassword: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { error: 'Not authenticated' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', session.user.id)
      .single();

    if (profile?.site_role !== 'parent') {
      return { error: 'Access denied' };
    }

    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Password update error:', error);
      return { error: 'Failed to update password' };
    }

    return { success: true };
  } catch (error) {
    console.error('Server action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}
