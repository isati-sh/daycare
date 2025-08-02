'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Baby, 
  Activity, 
  FileText, 
  Users,
  Home, 
  Settings,
} from 'lucide-react'
import { useSignOut } from '@/lib/auth/sign-out'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user, role, isAdmin } = useSupabase()
  const { signOut } = useSignOut()
  const isTeacher = role === 'teacher'
  const isParent = role === 'parent'

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple sign-out attempts
    setIsSigningOut(true);

    // The signOut function from our hook now handles all the logic,
    // including error handling, clearing storage, and redirection.
    await signOut();
  };

  const toggleMenu = () => setIsOpen(!isOpen)

  // If not logged in, show top nav with public links
  if (!user) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <Baby className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">DayCare</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Home
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </Link>
                <Link href="/programs" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Programs
                </Link>
                <Link href="/gallery" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Gallery
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Contact
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8l4 4-4 4" />
                  </svg>
                  <span>Sign In</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  // If logged in, show side nav based on role
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col z-40">
      <div className="flex items-center h-16 px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Baby className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">DayCare</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {isAdmin && (
          <>
            <Link
              href="/dashboard"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/admin/teachers"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Teachers
            </Link>
            <Link
              href="/dashboard/admin/parents"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Parents
            </Link>
            <Link
              href="/dashboard/admin/children"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Baby className="w-4 h-4 mr-2" />
              Manage Children
            </Link>
          </>
        )}
        {isTeacher && (
          <>
            <Link
              href="/dashboard/teacher"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Teacher Dashboard
            </Link>
            <Link
              href="/dashboard/teacher/children"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Baby className="w-4 h-4 mr-2" />
              My Students
            </Link>
            <Link
              href="/dashboard/teacher/activities"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Activity className="w-4 h-4 mr-2" />
              Plan Activities
            </Link>
            <Link
              href="/dashboard/teacher/reports"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Daily Reports
            </Link>
          </>
        )}
        {isParent && (
          <>
            <Link
              href="/dashboard/parent"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Parent Dashboard
            </Link>
            <Link
              href="/dashboard/parent/children"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Baby className="w-4 h-4 mr-2" />
              My Children
            </Link>
            <Link
              href="/dashboard/parent/activities"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <Activity className="w-4 h-4 mr-2" />
              View Activities
            </Link>
            <Link
              href="/dashboard/parent/reports"
              className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Child Reports
            </Link>
          </>
        )}
        <Link
          href="/dashboard/profile"
          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
        >
          <User className="w-4 h-4 mr-2" />
          Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>

        {/* Debug button for testing */}
        {process.env.NODE_ENV === 'development' && isClient && (
          <button
            onClick={() => {
              console.log('Debug: Current user state:', {
                user,
                role,
                isAdmin,
              });
              if (typeof window !== 'undefined') {
                console.log('Debug: localStorage:', localStorage);
                console.log('Debug: sessionStorage:', sessionStorage);
              }
            }}
            className="flex items-center w-full text-left px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          >
            <Settings className="w-3 h-3 mr-2" />
            Debug State
          </button>
        )}
      </nav>
    </aside>
  );
}