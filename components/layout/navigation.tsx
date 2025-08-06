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
              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/programs"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Programs
                </Link>
                <Link
                  href="/gallery"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Gallery
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Desktop Sign In Button */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 8l4 4-4 4"
                    />
                  </svg>
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12l4-4 4 4"
                    />
                  </svg>
                  <span>Sign Up</span>
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              About
            </Link>
            <Link
              href="/programs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              Programs
            </Link>
            <Link
              href="/gallery"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-gray-200">
              <Link href="/login">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 8l4 4-4 4"
                    />
                  </svg>
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center space-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth={2}
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12l4-4 4 4"
                    />
                  </svg>
                  <span>Sign Up</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // If logged in, show responsive side nav
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile menu button for logged in users */}
      <button
        onClick={toggleMenu}
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-lg p-2 shadow-lg border border-gray-200"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Side Navigation */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DayCare</span>
          </Link>
          <button
            onClick={toggleMenu}
            className="md:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {isAdmin && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/admin/teachers"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users className="w-4 h-4 mr-3" />
                Manage Teachers
              </Link>
              <Link
                href="/dashboard/admin/parents"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Users className="w-4 h-4 mr-3" />
                Manage Parents
              </Link>
              <Link
                href="/dashboard/admin/children"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Baby className="w-4 h-4 mr-3" />
                Manage Children
              </Link>
              <Link
                href="/dashboard/admin/profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>
            </>
          )}
          {isTeacher && (
            <>
              <Link
                href="/dashboard/teacher"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Teacher Dashboard
              </Link>
              <Link
                href="/dashboard/teacher/children"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Baby className="w-4 h-4 mr-3" />
                My Students
              </Link>
              <Link
                href="/dashboard/teacher/activities"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Activity className="w-4 h-4 mr-3" />
                Plan Activities
              </Link>
              <Link
                href="/dashboard/teacher/daily-logs"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4 mr-3" />
                Daily Logs
              </Link>
              <Link
                href="/dashboard/teacher/profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>
            </>
          )}
          {isParent && (
            <>
              <Link
                href="/dashboard/parent"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Home className="w-4 h-4 mr-3" />
                Parent Dashboard
              </Link>
              <Link
                href="/dashboard/parent/children"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Baby className="w-4 h-4 mr-3" />
                My Children
              </Link>
              <Link
                href="/dashboard/parent/activities"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Activity className="w-4 h-4 mr-3" />
                View Activities
              </Link>
              <Link
                href="/dashboard/parent/reports"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="w-4 h-4 mr-3" />
                Child Reports
              </Link>
              <Link
                href="/dashboard/parent/profile"
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>
            </>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
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
              className="flex items-center w-full text-left px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-3 h-3 mr-3" />
              Debug State
            </button>
          )}
        </nav>
      </aside>
    </>
  );
}