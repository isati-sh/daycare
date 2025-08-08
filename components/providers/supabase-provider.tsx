'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Role = 'admin' | 'teacher' | 'parent' | null;

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  client: SupabaseClient<Database>;
  role: Role;
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

export function SupabaseProvider({
  serverSession,
  children,
}: {
  serverSession: Session | null;
  children: React.ReactNode;
}) {
  const [client] = useState(() => createPagesBrowserClient<Database>());
  const [session, setSession] = useState<Session | null>(serverSession);
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = useCallback(async (userId: string): Promise<Role> => {
    const { data, error } = await client
      .from('profiles')
      .select('site_role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Role fetch error:', error);
      return null;
    }

    // Update last_login when user accesses the app
    const { error: updateError } = await client
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating last login:', updateError);
    }

    return data?.site_role ?? null;
  }, [client]);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userRole = await fetchUserRole(session.user.id);
        setRole(userRole);
      }

      setLoading(false);
    };

    getSession();

    const { data: listener } = client.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id).then(setRole);
      } else {
        setRole(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [client, fetchUserRole]);

  return (
    <SupabaseContext.Provider
      value={{
        client,
        session,
        user,
        role,
        isAdmin: role === 'admin',
        loading,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
