'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { type SupabaseClient, Session, User } from '@supabase/supabase-js';
import { Database } from '@/types/database';

type Role = 'admin' | 'teacher' | 'parent' | null;

type SupabaseContextType = {
  user: User | null;
  session: Session | null;
  client: SupabaseClient<Database>;
  role: Role;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
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

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => createPagesBrowserClient<Database>());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('site_role')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Failed to fetch role:', error.message);
        return null;
      }

      return data?.site_role ?? null;
    } catch (err) {
      console.error('Error fetching user role:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) {
        console.warn('Error getting session:', sessionError.message);
      }

      if (!isMounted) return;

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);

      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        if (!isMounted) return;
        setRole(role);
        setIsAdmin(role === 'admin');
      } else {
        setRole(null);
        setIsAdmin(false);
      }
    };

    const { data: listener } = client.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const role = await fetchUserRole(session.user.id);
          setRole(role);
          setIsAdmin(role === 'admin');
        } else {
          setRole(null);
          setIsAdmin(false);
        }
      }
    );

    init();

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, [client]);

  return (
    <SupabaseContext.Provider
      value={{
        client,
        session,
        user,
        role,
        isAdmin,
        loading,
        initialized,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}
