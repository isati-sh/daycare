import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Role = Profile['site_role'] | null;

interface AppStoreState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: Role;
  loading: boolean;
  profileLoaded: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  markInitialized: () => void;
  reset: () => void;
}

const initialState: Omit<AppStoreState, keyof {
  setSession: never;
  setProfile: never;
  setLoading: never;
  markInitialized: never;
  reset: never;
}> = {
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  profileLoaded: false,
  initialized: false,
};

export const useAppStore = create<AppStoreState>((set) => ({
  ...initialState,
  setSession: (session) =>
    set((state) => {
      const sameUser =
        !!session?.user?.id && state.profile?.id === session.user.id;
      return {
        session,
        user: session?.user ?? null,
        profile: sameUser ? state.profile : null,
        role: sameUser ? state.role : null,
        profileLoaded: sameUser && state.profileLoaded,
      };
    }),
  setProfile: (profile) =>
    set(() => ({
      profile,
      role: profile?.site_role ?? null,
      profileLoaded: true,
    })),
  setLoading: (loading) => set(() => ({ loading })),
  markInitialized: () => set(() => ({ initialized: true })),
  reset: () =>
    set(() => ({
      ...initialState,
    })),
}));
