'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/auth/auth-store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  return <>{children}</>
}
