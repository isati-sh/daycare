import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database';
import ProfileClient from './ProfileClient';

export const revalidate = 30;

function calculateProfileCompletion(profile: any): number {
  const requiredFields = ['full_name', 'phone', 'address', 'emergency_contact'];
  const completedFields = requiredFields.filter((field) => {
    const value = profile[field];
    return value !== null && value !== undefined && String(value).trim() !== '';
  });
  return Math.round((completedFields.length / requiredFields.length) * 100);
}

export default async function ParentProfilePage() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile || profile.site_role !== 'parent') {
    redirect('/access-denied?reason=not-parent');
  }

  const daysActive = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / 86400000
  );

  const profileCompletion = calculateProfileCompletion(profile);

  const profileData = {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    site_role: profile.site_role,
    phone: profile.phone,
    address: profile.address,
    emergency_contact: profile.emergency_contact,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    daysActive,
    profileCompletion,
  };

  return <ProfileClient profile={profileData} />;
}
