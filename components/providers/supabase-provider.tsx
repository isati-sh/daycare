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
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Get user profile with role
          const { data: profile, error: profileError } = await client
            .from('profiles')
            .select('site_role')
            .eq('id', session.user.id)
            .single();

          if (profileError) throw profileError;

          const userRole = (profile?.site_role as Role) ?? 'parent';
          setRole(userRole);
          setIsAdmin(userRole === 'admin');
        } else {
          setRole(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Reset to default state on error
        setSession(null);
        setUser(null);
        setRole(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            const { data: profile, error } = await client
              .from('profiles')
              .select('site_role')
              .eq('id', session.user.id)
              .single();

            if (error) throw error;

            const userRole = (profile?.site_role as Role) ?? 'parent';
            setRole(userRole);
            setIsAdmin(userRole === 'admin');
          } catch (error) {
            console.error('Error updating user role:', error);
            setRole('parent');
            setIsAdmin(false);
          }
        } else {
          setRole(null);
          setIsAdmin(false);
        }
      }
    );

    // Initialize auth state
    initializeAuth();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  if (loading) return null;

  return (
    <SupabaseContext.Provider value={{ user, session, client, role, isAdmin, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
}
