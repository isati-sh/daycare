'use client';

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

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
  setAuth: (user: any, profile: Profile | null) => void
  setError: (error: string | null) => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    profile: null,
    isLoading: false,
    initialized: false,
    error: null,

    setAuth: (user: any, profile: Profile | null) => {
      set({ user, profile, isLoading: false })
    },

    setError: (error: string | null) => {
      set({ error })
    },

    initialize: async () => {
      set({ isLoading: true })
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          set({ user: null, profile: null, isLoading: false, initialized: true, error: null })
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, site_role, active_status')
          .eq('id', user.id)
          .single()

        if (profileError) {
          set({
            error: profileError.message,
            isLoading: false,
            initialized: true,
          })
          return
        }

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
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, profile: null, error: null })
      } catch (err: any) {
        set({ error: err?.message || 'Failed to logout' })
      }
    },
  }
})

