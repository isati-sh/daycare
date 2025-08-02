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
];

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // If unauthenticated and accessing a protected route, redirect to login
    if (!session && !isPublic) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If authenticated and trying to access login/register, redirect to dashboard
    if (session && isAuthPage) {
      const redirect = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirect);
    }

    // Role-based route protection for authenticated users
    if (session && pathname.startsWith('/dashboard/')) {
      const roleRoutes = {
        admin: ['/dashboard/admin'],
        teacher: ['/dashboard/teacher'],
        parent: ['/dashboard/parent']
      };

      // Check if this is a role-specific route (including nested routes)
      const isRoleSpecificRoute = Object.values(roleRoutes).some(routes => 
        routes.some(route => pathname.startsWith(route + '/') || pathname === route)
      );

      if (isRoleSpecificRoute) {
        try {
          // Get user's role from profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('site_role')
            .eq('id', session.user.id)
            .single();

          // If there's an error fetching profile, allow access to prevent breaking
          if (error) {
            console.error('Error fetching user profile in middleware:', error);
            console.log('Continuing without role check due to error');
            return res; // Continue without role check
          }

          const userRole = profile?.site_role || 'parent';
          console.log('User role from profile:', userRole);
          const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];

          // Check if user has access to this route
          const hasAccess = allowedRoutes.some(route => pathname.startsWith(route + '/') || pathname === route);

          if (!hasAccess) {
            // Prevent redirect loops - don't redirect if already going to dashboard
            console.log('User does not have access to this route:', pathname);
            if (pathname === '/dashboard') {
              return res;
            }
            
            // Redirect to their appropriate dashboard section with error message
            const redirect = new URL('/dashboard', req.url);
            redirect.searchParams.set('error', 'unauthorized');
            redirect.searchParams.set('attempted', pathname);
            return NextResponse.redirect(redirect);
          }
        } catch (error) {
          console.error('Middleware error during role check:', error);
          // If any error occurs, continue without role check to prevent breaking the app
          return res;
        }
      }
    }

    return res;
  } catch (error) {
    console.error('Critical middleware error:', error);
    // If middleware completely fails, just continue to prevent breaking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|txt)$).*)',
  ],
};
