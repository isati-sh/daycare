import { create } from 'zustand'
import { createClient } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string
  site_role: 'admin' | 'teacher' | 'parent' | null
  active_status: boolean
}

export interface AuthState {
  user: any | null
  profile: Profile | null
  isLoading: boolean
  initialized: boolean
  error: string | null
  initializeAuth: () => Promise<void>
  logout: () => Promise<void>
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    profile: null,
    isLoading: false,
    initialized: false,
    error: null,

    initializeAuth: async () => {
      set({ isLoading: true })
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          set({ user: null, profile: null, isLoading: false, initialized: true })
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, email, full_name, site_role, active_status')
          .eq('id', user.id)
          .single()

        set({
          user,
          profile: profileData || null,
          isLoading: false,
          initialized: true,
          error: null,
        })
      } catch (err: any) {
        set({
          error: err?.message || 'Failed to initialize auth',
          isLoading: false,
          initialized: true,
        })
      }
    },

    logout: async () => {
      try {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      } catch (err: any) {
        set({ error: err?.message || 'Failed to logout' })
      }
    },
  }
})

