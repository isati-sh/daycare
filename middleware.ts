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

    // Allow public routes
    if (
      PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
    ) {
      return res;
    }

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If not logged in → redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const user = session.user;

    // Get profile once
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('site_role, active_status, email_verified')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.redirect(
        new URL('/access-denied?reason=profile-not-created', req.url)
      );
    }

    // Email not verified
    if (profile.email_verified === false) {
      return NextResponse.redirect(
        new URL('/access-denied?reason=email-not-verified', req.url)
      );
    }

    // Account not activated
    if (!profile.active_status) {
      return NextResponse.redirect(
        new URL('/access-denied?reason=account-not-activated', req.url)
      );
    }

    // ROUTE-BASED ROLE CHECK
    if (pathname.startsWith('/dashboard')) {
      const userRole = profile.site_role;

      if (!userRole) {
        return NextResponse.redirect(
          new URL('/access-denied?reason=role-not-assigned', req.url)
        );
      }

      // Auth check using helper
      if (!isAllowed(userRole, pathname)) {
        return NextResponse.redirect(
          new URL('/access-denied?reason=forbidden', req.url)
        );
      }

      // pass role to frontend
      res.headers.set('x-user-role', userRole);
      res.headers.set('x-user-id', user.id);
    }

    return res;
  } catch (err) {
    console.error('Middleware error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|txt)$).*)',
  ],
};
