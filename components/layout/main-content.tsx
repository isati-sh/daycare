'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/components/providers/supabase-provider';

interface MainContentProps {
  children: React.ReactNode
}

export default function MainContent({ children }: MainContentProps) {

  const router = useRouter();
  const pathname = usePathname()
  const { role } = useSupabase();
  
  // Apply margin only for dashboard routes
  const shouldApplyMargin = pathname.startsWith('/dashboard')


  const hasSupabaseAuthTokenCookie = () => {
    const allCookies = document.cookie.split(';');
    return allCookies.some((cookie) => {
      const name = cookie.split('=')[0].trim();
      return /^sb-.*-auth-token$/.test(name);
    });
  }

  useEffect(() => {
    if (
      hasSupabaseAuthTokenCookie() &&
      (pathname === '/' || pathname === '/login' || pathname === '/register')
    ) {
      router.push(`/dashboard/${role}`);
    }
  }, [router, pathname, role]);


  
  return (
    <main className={`min-h-screen transition-all duration-300 ${
      shouldApplyMargin ? 'md:ml-64' : ''
      }`}>
      {children}
    </main>
  )
} 