'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSupabase } from '@/components/providers/supabase-provider';
import { isAllowed } from '@/lib/auth/access-control';

export default function RoleGuard({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const { role, loading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role && !isAllowed(role, path)) {
      router.replace('/access-denied');
    }
  }, [loading, role, path, router]);

  if (loading || !role) return null;

  return <>{children}</>;
}
