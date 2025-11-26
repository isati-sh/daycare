'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuth, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
    }
  }, [initialized, initializeAuth])

  return <>{children}</>
}
