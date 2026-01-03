import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: When Supabase is connected, add actual auth checks here
  // For now, middleware just passes through

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Auth routes that should redirect to dashboard if already authenticated
  const authRoutes = ["/login", "/signup"];
  const isAuthRoute = authRoutes.includes(pathname);

  // TODO: Implement actual auth check
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();

  // For development, always allow access
  // In production with Supabase:
  // if (isProtectedRoute && !user) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }
  // if (isAuthRoute && user) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
