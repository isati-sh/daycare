import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const runtime = 'experimental-edge'; // VERY IMPORTANT!

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/programs',
  '/gallery',
  '/contact',
  '/_next',
  '/api',
  '/static',
  '/favicon.ico'
];

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { pathname } = req.nextUrl;

    // Skip middleware for public routes and static assets
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
      return res;
    }

    // Get the session
    const { data: { session } } = await supabase.auth.getSession();

    // Handle unauthenticated access to protected routes
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Handle authenticated users trying to access auth pages
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // For all other routes, let the client-side handle the auth state
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, continue the request to prevent breaking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|txt)$).*)',
  ],
};
