'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Role = 'admin' | 'teacher' | 'parent';

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  client: SupabaseClient<Database>;
  role: Role | null;
  isAdmin: boolean;
  loading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context)
    throw new Error('useSupabase must be used within SupabaseProvider');
  return context;
};

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => createPagesBrowserClient<Database>());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSessionAndRole = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('site_role')
          .eq('id', session.user.id)
          .single();

        const userRole = (profile?.site_role as Role) ?? 'parent';
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      }

      setLoading(false);
    };

    getSessionAndRole();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('site_role')
          .eq('id', session.user.id)
          .single();

        const userRole = (profile?.site_role as Role) ?? 'parent';
        setRole(userRole);
        setIsAdmin(userRole === 'admin');
      } else {
        setRole(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  if (loading) return null;

  return (
    <SupabaseContext.Provider value={{ user, session, client, role, isAdmin, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}
