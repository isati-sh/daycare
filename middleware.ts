import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAllowed } from '@/lib/auth/access-control';

export const runtime = 'experimental-edge';

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/programs',
  '/gallery',
  '/contact',
  '/access-denied',
  '/_next',
  '/api',
  '/static',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { pathname } = req.nextUrl;

    if (
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
    ) {
      return res;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect to dashboard if already logged in and on root or login/register
    if (session && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
      // Set a header to hint client-side redirect if needed
      res.headers.set('x-redirect-dashboard', 'true');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (session) {
      const { error: cookieError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      if (cookieError) console.error('Cookie set error:', cookieError);
    }

    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const user = session.user;

    // 📌 Create profile if missing
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('site_role, active_status, email_verified')
      .eq('id', user.id)
      .single();

    if (profileError?.code === 'PGRST116') {
      const insertRes = await supabase.from('profiles').insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        site_role: null,
        active_status: true, // New users who register directly are active
        email_verified: true, // New users who complete signup are verified
        created_at: new Date().toISOString(),
      });

      if (insertRes.error) {
        console.error('Failed to create profile:', insertRes.error);
        return NextResponse.redirect(new URL('/access-denied', req.url));
      }
    }

    // Check if user's email is verified from the database profile
    if (profile && profile.email_verified === false) {
      return NextResponse.redirect(new URL('/access-denied?reason=email-not-verified', req.url));
    }

    // Check if user profile is active (for invited users)
    if (profile && !profile.active_status) {
      return NextResponse.redirect(new URL('/access-denied?reason=account-not-activated', req.url));
    }

    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard/')) {
      const { data: roleProfile, error } = await supabase
        .from('profiles')
        .select('site_role')
        .eq('id', user.id)
        .single();

      if (error || !roleProfile) {
        return NextResponse.redirect(new URL('/access-denied', req.url));
      }

      // If user has no role assigned, redirect to role pending page
      if (!roleProfile.site_role) {
        return NextResponse.redirect(new URL('/access-denied?reason=role-not-assigned', req.url));
      }

      const userRole = roleProfile.site_role;
      if (!isAllowed(userRole, pathname)) {
        return NextResponse.redirect(new URL('/access-denied', req.url));
      }

      res.headers.set('x-user-role', userRole);
      res.headers.set('x-user-id', user.id);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|txt)$).*)',
  ],
};
