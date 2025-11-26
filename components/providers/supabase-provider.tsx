'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

type Role = 'admin' | 'teacher' | 'parent' | null;

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(serverSession);
  const [user, setUser] = useState<User | null>(serverSession?.user ?? null);
  const [role, setRole] = useState<Role>(null);
  // Start with loading false if we have serverSession to match server render
  const [loading, setLoading] = useState(!serverSession);

  const fetchUserRole = useCallback(async (userId: string): Promise<Role> => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('site_role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Role fetch error:', error);
      return null;
    }

    // Update last_login when user accesses the app
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating last login:', updateError);
    }

    return data?.site_role ?? null;
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    const getSession = async () => {
      // Only fetch if we don't have a server session to avoid unnecessary updates
      if (serverSession) {
        // If we have serverSession, just verify and update role if needed
        if (serverSession.user) {
          const userRole = await fetchUserRole(serverSession.user.id);
          setRole(userRole);
        }
        setLoading(false);
      } else {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setRole(null);
        }

        setLoading(false);
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
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
  }, [fetchUserRole, serverSession]);

  return (
    <SupabaseContext.Provider
      value={{
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
