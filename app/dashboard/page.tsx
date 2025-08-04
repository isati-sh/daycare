'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

export default function DashboardRedirect() {
  const { role, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role) {
      const target = `/dashboard/${role}`;
      router.replace(target);
    }
  }, [role, loading, router]);

  return <p className="text-center p-8 text-gray-500">Loading dashboard...</p>;
}
