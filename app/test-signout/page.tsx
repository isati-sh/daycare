'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, User, Shield, Loader2 } from 'lucide-react'
import { useSignOut } from '@/lib/auth/sign-out'
import { useSupabase } from '@/components/providers/supabase-provider'
import toast from 'react-hot-toast'

export default function TestSignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, role, isAdmin } = useSupabase()
  const { signOut } = useSignOut()

  useEffect(() => {
    // Auto-trigger sign out when component mounts
    const performSignOut = async () => {
      setIsSigningOut(true)
      await signOut('/')
    }
    
    // Add a small delay to show the loading state
    const timer = setTimeout(() => {
      performSignOut()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [signOut])

  const handleSignOutClick = async () => {
    setIsSigningOut(true)
    await signOut('/')
  }

  const checkAuthState = () => {
    console.log('🧪 Test: Current auth state:', {
      user: user ? { id: user.id, email: user.email } : null,
      role,
      isAdmin,
      hasSession: !!user
    })
    
    if (typeof window !== 'undefined') {
      console.log('🧪 Test: localStorage keys:', Object.keys(localStorage))
      console.log('🧪 Test: sessionStorage keys:', Object.keys(sessionStorage))
    }
  }

  if (isSigningOut) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-lg font-medium">Signing you out...</p>
          <p className="text-muted-foreground">Please wait while we securely sign you out.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Sign Out Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Current User:</strong> {user ? user.email : 'None'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Role:</strong> {role || 'None'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={checkAuthState} variant="outline" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Check State
            </Button>
            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={handleSignOutClick}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            Check the browser console for detailed logs
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 