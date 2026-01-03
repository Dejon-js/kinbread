import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Middleware for handling authentication and route protection
 *
 * Protected routes:
 * - /dashboard/* - Requires authenticated baker
 * - /onboarding - Requires authenticated user without baker profile
 *
 * Redirect logic:
 * - Unauthenticated users on protected routes → /login
 * - Authenticated users on /login or /signup → /dashboard or /onboarding
 */
export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth checks
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    // Public baker pages (slug routes like /baker-name or /baker-name/book/*)
    (!pathname.startsWith('/dashboard') &&
     !pathname.startsWith('/onboarding') &&
     !pathname.startsWith('/login') &&
     !pathname.startsWith('/signup'));

  // Auth routes (login/signup)
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  // Protected dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // Onboarding route
  const isOnboardingRoute = pathname === '/onboarding';

  // If user is authenticated
  if (user) {
    // Redirect away from auth pages to dashboard
    if (isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    // User is not authenticated

    // Protect dashboard and onboarding routes
    if (isDashboardRoute || isOnboardingRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
